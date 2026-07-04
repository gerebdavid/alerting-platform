# ARCHITECTURE.md

> Structural map of the codebase: how packages, modules, and requests connect.
> For feature-by-feature progress and product scope, see [SCOPE.md](./SCOPE.md) instead — this file describes *how things are wired*, not *what's done*.

## Monorepo layout

npm workspaces, three packages:

```
packages/
  shared/    @app/shared   — enums, DTOs, zod schemas shared by backend + frontend
  backend/   @app/backend  — Express API, Prisma/SQLite
  web/       @app/web      — Vue 3 SPA
bruno/                     — API collection (manual/CLI testing against the backend)
```

`@app/shared` is a plain TS source package (no build step consumed directly — both `backend` and `web` import its `.ts` files straight from `src/`, resolved via the workspace symlink). It's the single source of truth for anything that crosses the frontend/backend boundary: enum values (`Role`, `AlertCategory`, `ChannelType`, `EventSeverity`, `NotificationStatus`), request/response DTO shapes, and zod validation schemas. Changing a field on an API payload means editing `packages/shared` first, then both consumers.

## Backend (`packages/backend`)

### Request lifecycle

```
HTTP request
  → app.ts (express.json())
  → <module>.routes.ts       (Router; requireAuth mounted via router.use() where the whole module needs auth)
  → middleware chain          (requireAuth → optionally requireRole)
  → <module>.controller.ts    (handler() wrapper: zod-validates params/query/body, calls the service)
  → <module>.service.ts       (business logic + Prisma calls; throws HttpError for expected failures)
  → src/db/prisma.ts          (Prisma Client, better-sqlite3 driver adapter)
  → SQLite (dev.db)
  ← errors bubble to next(err) → middleware/error.middleware.ts → { error: string } JSON response
```

Every feature module (`src/modules/<name>/`) follows the same three-file shape — see `modules/auth/` as the reference implementation, replicated by `modules/categories/`, `modules/alerts/`, and `modules/events/`. (`modules/notifications/` is the one exception — it's a service-only module invoked internally by `modules/events/`, not exposed via its own routes, so it has no `*.routes.ts`/`*.controller.ts`.)

- `*.routes.ts` — Express `Router`, mounts middleware and maps HTTP verbs to controller handlers.
- `*.controller.ts` — thin: built with `handler()` (`src/lib/handler.ts`), which zod-validates `{ params?, query?, body? }` and hands the parsed data to the callback as a typed third argument, auto-throwing `HttpError(400, ...)` on validation failure and forwarding thrown/rejected errors to `next()`.
- `*.service.ts` — the actual logic: Prisma queries, ownership checks, mapping DB rows to shared-package `*Response` DTOs (`toXResponse` helper per module).

Admin-only endpoints live under a separate `/api/admin/*` prefix (first used by `modules/events/`), mounted with both `requireAuth` and `requireRole(Role.ADMIN)` on the router — this namespace is where Epic 6's other admin endpoints (user management, alert management, notification log) will also live.

### Event generation (`src/modules/events/`)

Per SCOPE.md's fixed design decision, mock event data is generated behind an `EventSource` interface (`event-source.ts`) so a real feed can replace it later without touching callers:
```ts
interface EventSource {
  generate(input: { categoryCode: AlertCategory; severity?: EventSeverity }): GeneratedEvent;
}
```
`mock-event-source.ts`'s `MockEventSource` is the only implementation today — a handful of canned title/description templates per category, a fixed `sourceName` per category, and a random `severity` fallback when the caller doesn't specify one. `events.service.ts` holds a single module-level `const eventSource: EventSource = new MockEventSource()`; swapping in a real source later is a one-line change. `POST /api/admin/events/trigger` (admin-only) is the only way to create an `Event` row right now; after creating it, `events.service.ts` immediately hands off to `modules/notifications/` (below) to find and notify matching alerts, returning the real results in `TriggerMockEventResponse { event, notifications }`.

### Matching & dispatch (`src/modules/notifications/`)

This is the pipeline that runs synchronously inside `triggerMockEvent` right after the `Event` row is created — there's no queue or async job, it's plain sequential `await`s within the same request:

1. **Candidate fetch** — `events.service.ts` queries `prisma.alert.findMany({ where: { categoryId }, include: { user: true } })`: every alert for the event's category, enabled or not.
2. **Matching** (`matcher.ts`) — `matchAlerts(alerts, event)` is a pure function (no DB/IO) that filters candidates down to `categoryId matches && isEnabled`. It's generic over the input shape, so it accepts the richer Prisma-shaped alerts (with `user` attached) and returns that same richer type — no separate mapping step. Deliberately kept pure and DB-free (per SCOPE.md's "pure alert-matching engine" requirement) so future rules (severity thresholds, quiet hours, dedup) are testable additions to this one function rather than a growing Prisma `where` clause. Unit-tested in `matcher.test.ts`.
3. **Dispatch** (`dispatcher.ts`) — for each matched alert, looks up the right `NotificationChannel` via `channel-registry.ts`'s `getChannel(type)`, calls `send()` (wrapped in try/catch — a channel throwing is recorded as a `"failed"` `Notification` instead of failing the whole trigger request), then `prisma.notification.create(...)` and maps to a `NotificationLogEntry`.
4. **Channels** (`notification-channel.ts` + `channels/`) — `EmailChannel`/`SlackChannel` both implement the same `NotificationChannel` interface and, per the fixed design decision, just log a line (`logger.info`) and report `"sent"` instead of calling real SMTP/Slack APIs. `channel-registry.ts` is the one place that maps `ChannelType` → implementation; adding a real channel later means writing one new class and registering it there.

### Cross-cutting building blocks (`src/lib/`, `src/middleware/`, `src/config/`)

- `lib/handler.ts` — generic Express handler factory described above; every controller function is built with it.
- `lib/http-error.ts` — `HttpError(statusCode, message)`, the only way modules signal an expected failure (404/409/401/etc.); anything else is treated as a 500.
- `lib/jwt.ts` / `lib/password.ts` — pure helpers (sign/verify JWT, hash/compare bcrypt), framework-agnostic, unit-tested (`*.test.ts` next to each).
- `middleware/auth.middleware.ts` (`requireAuth`) — parses `Authorization: Bearer <token>`, verifies it, attaches `req.user = { userId, role }` (typed via `src/types/express.d.ts` augmenting Express's `Request`).
- `middleware/role.middleware.ts` (`requireRole(role)`) — 403 if `req.user.role` doesn't match; chained after `requireAuth`.
- `middleware/error.middleware.ts` — mounted last in `app.ts`; the single place HTTP error responses are shaped.
- `config/env.ts` — loads `.env` once, exports a typed `env` object, throws at boot if `JWT_SECRET` is missing. Everything that needs config (JWT helpers, `db/prisma.ts`, `index.ts`) imports `env` from here rather than reading `process.env` directly.
- `db/prisma.ts` — the one Prisma Client instance, constructed with the `better-sqlite3` driver adapter (required by Prisma 7's TS query-compiler client even for SQLite).

### Data model (`prisma/schema.prisma`)

```
User ──< Alert >── Category ──< Event
              \                  /
               \                /
                >── Notification ──<
```

- `User` — email/passwordHash/role (`"user"|"admin"` as a plain string — SQLite has no native enum type in Prisma, so role/channel/severity/status are strings validated against `@app/shared`'s enums at the app layer, not the DB layer).
- `Category` — the fixed set of alert categories (seeded, not user-created).
- `Alert` — a user's subscription to `category + channel`; `@@unique([userId, categoryId, channel])` prevents duplicates at the DB level (backed by an app-layer check in `alerts.service.ts` for a friendlier 409 before the constraint would even fire).
- `Event` — created by `modules/events/` (Epic 4) via the admin trigger endpoint; `triggeredById` records which admin fired it, `payload` is a JSON-stringified blob (SQLite has no native JSON column type here) of extra mock data.
- `Notification` — one row per dispatch attempt, created by `modules/notifications/dispatcher.ts` (Epic 5); `status`/`detail` record the outcome (`"sent"` for the mock channels today, `"failed"` if a channel throws). `alertId` is nullable with `onDelete: SetNull` — deleting an `Alert` that has notification history doesn't fail (the FK would otherwise reject it) and doesn't erase the history either; the `Notification` row survives as an audit record with `alertId` set to `null`. (`eventId` has no such handling — events aren't deletable through any current endpoint, so that FK stays `Restrict`.)

Migrations live in `prisma/migrations/`. Note: `prisma migrate dev` requires a TTY and doesn't work in a non-interactive shell here — migrations in this project so far were created by generating the SQL diff (`prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`) into a hand-made timestamped migration folder, then applying it with `prisma migrate deploy` (see `.claude/rules/prisma-migration.md`).

### Path aliases

`~/*` → `packages/backend/src/*` (works natively in dev via `tsx`; for production builds, `tsc` compiles then `tsc-alias` rewrites the emitted `~/...` imports to relative paths, since `tsc` alone doesn't touch import specifiers).

## Frontend (`packages/web`)

Vue 3 + Vite + TypeScript + Tailwind v4 (CSS-first config) + Vue Router + Pinia.

- `@/*` → `packages/web/src/*` (mirrors the backend's `~/*` alias; configured in both `tsconfig.json` `paths` for type-checking and `vite.config.ts` `resolve.alias` for the actual bundler resolution, since Vite doesn't read `tsconfig.json` paths on its own).
- Vite dev server proxies `/api/*` → `http://localhost:3000` (the backend), so the frontend always calls relative `/api/...` paths — no CORS config needed in dev, and the same relative paths work unmodified once both are served from one origin in production.

### Design tokens (`src/tailwind.config.css`)

Tailwind v4 has no `tailwind.config.js` — theme customization is CSS-first via an `@theme` block. `src/tailwind.config.css` defines two kinds of tokens:
- **Brand palettes as full numeric scales** — `primary-{50..900}`, `secondary-{50..900}`, `danger-{50..900}`, same shape as Tailwind's built-in palettes, so any shade is available as a utility (`bg-primary-900`, `text-danger-600`, `border-primary-700`, ...). Components pick the specific shade they need, same as they would with a built-in palette like `slate-*`.
- **Neutral single-value tokens** — `surface`, `background`, `border`, `text`/`-muted`/`-subtle`, each aliased to one fixed shade (no numeric scale) since these represent one fixed role (page background, card border, body text) rather than a brand color needing a range.

It's imported into `src/style.css` right after `@import "tailwindcss"`. Every component uses these tokens instead of Tailwind's raw palette classes (`bg-slate-900`, `text-red-600`, etc.) so the app's whole palette can be changed by editing this one file. The current hex values intentionally match Tailwind's `slate` (primary/secondary) and `red` (danger) palettes 1:1 — this is a renaming/structuring layer, not a redesign.

### App shell & routing (`src/main.ts`, `src/router.ts`)

`main.ts` installs Pinia and the router, then calls `useAuthStore().hydrate()` and defers `app.mount()` until it resolves — so the first route navigation always sees correct auth state (no login-page flash for an already-logged-in user with a stored token). `App.vue` is just `<router-view />`.

`router.ts` defines three kinds of routes:
- Public: `/login`, `/signup` (`meta.requiresAuth: false`).
- Authenticated: a layout route at `/` (`meta.requiresAuth: true`, component `layouts/AuthenticatedLayout.vue`) with a `dashboard` child at the empty path.
- Admin: a nested `admin` route under the same authenticated layout, component `layouts/AdminLayout.vue`, gated with `meta.roles: [Role.ADMIN]` (the first real use of the `meta.roles` mechanism that was set up in Epic 3 ahead of time). Its own children are Epic 6's individual admin pages — today just `admin-trigger-event`, with a redirect from the bare `admin` path to it. `AdminLayout.vue` renders a small tab-style sub-nav (one entry per admin page) + `<router-view />`, so each new admin page (notification log, alert management, user management) is one new child route + one new tab entry, no rework of the shell.

A single `router.beforeEach` guard reads `useAuthStore()` and redirects: unauthenticated users away from `requiresAuth` routes to `/login`; authenticated users away from `/login`/`/signup` to `dashboard`; users lacking a required role (checked via `to.matched.flatMap(r => r.meta.roles ?? [])`) to `dashboard`.

### State (`src/stores/`)

Pinia setup-stores, each owning one slice of server state:
- `auth.store.ts` — `token` (persisted to `localStorage`) + `user` (re-fetched via `GET /api/auth/me` on `hydrate()` rather than persisted, so a stale role/email never survives a refresh); `login`/`signup`/`logout` actions.
- `categories.store.ts` — fetch-once cache of `GET /api/categories` (static reference data).
- `alerts.store.ts` — the current user's alerts; `fetchAlerts`/`createAlert`/`updateAlert`/`removeAlert`, each mutating the local `alerts` ref after a successful API call.
- `admin-events.store.ts` — admin-only; `triggerEvent(input)` posts to `/api/admin/events/trigger` and holds only the *most recent* result (`lastResult`) — a running history of past triggers is the separately-planned notification log page's job, not this store's.

These are stores (not page-local composables) so they're reusable across pages — `categories.store.ts` is already shared between the user dashboard and the admin trigger-event page.

### API client (`src/lib/api.ts`)

A thin `fetch` wrapper: `api.get/post/patch/delete`. Reads the token from `useAuthStore()` and attaches `Authorization: Bearer <token>` when present; throws `ApiError(status, message)` on a non-2xx response, reading `message` from the backend's `{ error: string }` shape.

If a request that *carried* a token comes back `401` (expired/tampered/revoked session — e.g. the token was edited directly in `localStorage`), `api.ts` treats that as "the session is dead" and unilaterally calls `auth.logout()` + redirects to `/login`, in addition to throwing `ApiError` as normal. A `401` on a request with no token attached (e.g. wrong password on `/api/auth/login`) is left alone — that's just a normal error for the caller to display, not a session invalidation. Because this lives in the one shared `request()` function, every store/page gets this behavior for free without special-casing 401s themselves.

This creates a deliberate three-way circular import — `api.ts` → `router.ts` → `auth.store.ts` → `api.ts` — safe here because all three only reference each other inside function bodies (route guards, request handlers, store actions), never at module-evaluation time.

### UI composition (`src/components/`, `src/pages/`, `src/layouts/`)

- `components/ui/` — base building blocks (`BaseButton`, `BaseInput`, `BaseSelect`, `BaseCard`), reused everywhere forms/lists appear. New UI needs should extend or reuse these before adding new one-off elements (`.claude/rules/vue-patterns.md`).
- `components/alerts/` — `AlertForm` (create form, client-side validated via `createAlertSchema.safeParse` from `@app/shared` before emitting) and `AlertList`/`AlertListItem` (presentational; emit `updateChannel`/`toggleEnabled`/`remove` up to the page).
- `pages/` — orchestration only: `LoginPage`/`SignupPage` wire the auth store to a form; `DashboardPage` wires `alerts.store.ts` + `categories.store.ts` and renders the alert components; `AdminTriggerEventPage` wires `admin-events.store.ts` + `categories.store.ts`, client-side validates via `triggerMockEventSchema.safeParse`, and renders the last trigger's event + notifications inline. None make direct API calls of their own — that's always the stores' job.
- `layouts/AuthenticatedLayout.vue` — nav bar (user email, logout, and a toggle link shown only when `auth.isAdmin`: "Admin" when on the user side, "← Dashboard" when already under `/admin/*`, based on `route.path.startsWith("/admin")`) + `<router-view />`, shared by every authenticated page.
- `layouts/AdminLayout.vue` — nested inside `AuthenticatedLayout` for the `/admin/*` routes: a tab-style sub-nav + `<router-view />`. Each Epic 6 admin page adds one entry to its `tabs` array.

## Auth flow (cross-cutting)

1. `POST /api/auth/signup` or `/login` → backend issues a JWT (`{ userId, role }` payload, `jsonwebtoken`, expiry via `JWT_EXPIRES_IN`) and returns it in the JSON body (not a cookie — the whole app uses header-based auth by design).
2. The frontend's `auth.store.ts` persists the token to `localStorage` and attaches it as `Authorization: Bearer <token>` on every request via `src/lib/api.ts`.
3. `requireAuth` middleware verifies the token per-request and populates `req.user`; there is no server-side session store — the JWT itself is the credential, valid until it expires.
4. Role-gated routes add `requireRole(Role.ADMIN)` after `requireAuth` in the route chain — first used by `/api/admin/events/trigger` (Epic 4); Epic 6 adds more under the same `/api/admin/*` prefix. The frontend router mirrors this with `meta.roles` on route records (not yet exercised by an actual admin page — that's Epic 6).

## API testing (`bruno/`)

A Bruno collection mirrors the live API, organized to match `src/modules/`: `bruno/auth/`, `bruno/categories/`, `bruno/alerts/`, `bruno/admin/`. Each folder has a `folder.bru` with a `seq` so the whole collection runs in dependency order (`auth` → `categories` → `alerts` → `admin`) when executed together — `auth/Login.bru` authenticates as the seeded admin and captures the JWT into a runtime variable (`bru.setVar("token", ...)`) that every other authenticated request reuses via `auth: bearer` + `{{token}}`. Per `.claude/rules/bruno.md`, every new/changed route gets a matching request here. Run the whole thing with:
```
npx @usebruno/cli run bruno -r --env Local
```

## Testing

`vitest` is configured per-package (currently only `packages/backend`). Coverage so far is limited to pure-function helpers (`lib/jwt.ts`, `lib/password.ts`, `modules/notifications/matcher.ts`) — controller/service/integration test coverage (including the dispatcher, which does real I/O) is deferred to Epic 7 per SCOPE.md, so don't read the current test suite as representative of what *should* be tested long-term, just what's been prioritized so far.
