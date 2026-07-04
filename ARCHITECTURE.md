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

Every feature module (`src/modules/<name>/`) follows the same three-file shape — see `modules/auth/` as the reference implementation, replicated by `modules/categories/` and `modules/alerts/`:

- `*.routes.ts` — Express `Router`, mounts middleware and maps HTTP verbs to controller handlers.
- `*.controller.ts` — thin: built with `handler()` (`src/lib/handler.ts`), which zod-validates `{ params?, query?, body? }` and hands the parsed data to the callback as a typed third argument, auto-throwing `HttpError(400, ...)` on validation failure and forwarding thrown/rejected errors to `next()`.
- `*.service.ts` — the actual logic: Prisma queries, ownership checks, mapping DB rows to shared-package `*Response` DTOs (`toXResponse` helper per module).

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
- `Event` / `Notification` — not yet driven by real logic (Epics 4–5); modeled in the schema but no service layer exists for them yet.

Migrations live in `prisma/migrations/`. Note: `prisma migrate dev` requires a TTY and doesn't work in a non-interactive shell here — migrations in this project so far were created by generating the SQL diff (`prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`) into a hand-made timestamped migration folder, then applying it with `prisma migrate deploy` (see `.claude/rules/prisma-migration.md`).

### Path aliases

`~/*` → `packages/backend/src/*` (works natively in dev via `tsx`; for production builds, `tsc` compiles then `tsc-alias` rewrites the emitted `~/...` imports to relative paths, since `tsc` alone doesn't touch import specifiers).

## Frontend (`packages/web`)

Vue 3 + Vite + TypeScript + Tailwind v4 (CSS-first config, no `tailwind.config.*`). Currently just the Epic 1 scaffold — `App.vue`/`main.ts` with no router, store, or pages yet (Epic 3, in progress, adds all of that: `vue-router`, Pinia stores, an API client, and the first real pages). This section will expand once that lands.

- `@/*` → `packages/web/src/*` (mirrors the backend's `~/*` alias; configured in both `tsconfig.json` `paths` for type-checking and `vite.config.ts` `resolve.alias` for the actual bundler resolution, since Vite doesn't read `tsconfig.json` paths on its own).
- Vite dev server proxies `/api/*` → `http://localhost:3000` (the backend), so the frontend always calls relative `/api/...` paths — no CORS config needed in dev, and the same relative paths work unmodified once both are served from one origin in production.

## Auth flow (cross-cutting)

1. `POST /api/auth/signup` or `/login` → backend issues a JWT (`{ userId, role }` payload, `jsonwebtoken`, expiry via `JWT_EXPIRES_IN`) and returns it in the JSON body (not a cookie — the whole app uses header-based auth by design, so the frontend is responsible for storing and attaching the token).
2. Every subsequent authenticated request carries `Authorization: Bearer <token>`.
3. `requireAuth` middleware verifies the token per-request and populates `req.user`; there is no server-side session store — the JWT itself is the credential, valid until it expires.
4. Role-gated routes (none yet in the API beyond the `role` field existing — Epic 6 adds admin-only endpoints) add `requireRole("admin")` after `requireAuth` in the route chain.

## API testing (`bruno/`)

A Bruno collection mirrors the live API, organized to match `src/modules/`: `bruno/auth/`, `bruno/categories/`, `bruno/alerts/`. Each folder has a `folder.bru` with a `seq` so the whole collection runs in dependency order (`auth` → `categories` → `alerts`) when executed together — `auth/Login.bru` captures the JWT into a runtime variable (`bru.setVar("token", ...)`) that every other authenticated request reuses via `auth: bearer` + `{{token}}`. Per `.claude/rules/bruno.md`, every new/changed route gets a matching request here. Run the whole thing with:
```
npx @usebruno/cli run bruno -r --env Local
```

## Testing

`vitest` is configured per-package (currently only `packages/backend`). Coverage so far is limited to pure-function helpers (`lib/jwt.ts`, `lib/password.ts`) — controller/service/integration test coverage is deferred to Epic 7 per SCOPE.md, so don't read the current test suite as representative of what *should* be tested long-term, just what's been prioritized so far.
