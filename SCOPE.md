# SCOPE.md

> Read this file before starting any planning or implementation work on this project.
> Update the status table whenever a feature phase is completed or materially progressed.

## Project Overview

A world-event alerting platform. Users configure alerts by category
(breaking-news, markets, natural-disasters) and delivery channel
(email, Slack). When a world event occurs, a matching engine finds
alerts that should fire and dispatches notifications through a
pluggable channel-adapter system. v1 uses a mocked/simulated event
feed and logs notifications instead of sending real emails/Slack
messages, but both the event source and notification channels are
built behind interfaces so real integrations can be swapped in later
with minimal change. A single Vue 3 app serves both regular users and
role-gated admins.

## Tech Stack

- Monorepo: npm workspaces (`packages/shared`, `packages/backend`, `packages/web`)
- Backend: Node.js + Express + TypeScript + Prisma + SQLite
- Frontend: Vue 3 + TypeScript + Tailwind CSS + Pinia + Vue Router
- Auth: JWT (email/password, bcrypt-hashed, role: user|admin)
- Testing: Vitest

## Big Features / Epics

| # | Epic | Description |
|---|------|-------------|
| 1 | Monorepo scaffold | Workspaces, shared types package, tooling, env config |
| 2 | Data model & auth | Prisma schema, migrations, seed, signup/login, JWT + role middleware |
| 3 | Alert management (user) | CRUD alerts by category+channel, categories endpoint, dashboard UI |
| 4 | Event engine | EventSource interface + mock implementation, admin trigger endpoint |
| 5 | Matching & dispatch | Pure alert-matching engine, NotificationChannel interface, email/slack adapters, dispatcher, notification log persistence |
| 6 | Admin views | User management, alert management, notification log, trigger-mock-event UI |
| 7 | Testing & polish | Unit tests for matcher/dispatcher/auth, README, error handling, loading/empty states |

## Progress Tracker

| Epic | Status | Notes |
|------|--------|-------|
| 1. Monorepo scaffold | Done | Workspaces + tsconfig.base.json done. `packages/shared` built (enums, DTOs, zod schemas). Minimal `packages/backend` (Express, `/api/health`) and `packages/web` (Vite+Vue3+TS+Tailwind v4) scaffolds boot and talk to each other via the dev proxy. Root `npm run dev` runs both via `concurrently`. All deps upgraded to current latest (Vite 8, Tailwind 4, Vue 3.5, Express 5, TS 6, zod 4). `~`/`@` path aliases wired for backend/frontend (dev + build). Env config closed out via `packages/backend/src/config/env.ts` (`dotenv` loaded once, typed `env` object, fails fast if `JWT_SECRET` missing). |
| 2. Data model & auth | Done | Prisma + SQLite wired up (`packages/backend/prisma/schema.prisma`: User, Category, Alert, Event, Notification — SQLite has no native enum support in Prisma, so role/channel/severity/status are `String` fields validated against `@app/shared` enums). Prisma 7's new TS query-compiler client requires an explicit driver adapter even for SQLite (`@prisma/adapter-better-sqlite3`), wired in `src/db/prisma.ts`. Initial migration applied, seed script populates the 3 categories plus a hardcoded admin user (`admin@example.com` / `Admin123!`). Auth implemented: `POST /api/auth/signup`, `POST /api/auth/login` (bcrypt hash/compare, JWT via `jsonwebtoken`, `Authorization: Bearer` scheme), `GET /api/auth/me`; `requireAuth`/`requireRole` middleware in `src/middleware/`; centralized error handler + `HttpError`. Verified end-to-end via curl (signup, duplicate-email 409, login, protected route with/without/invalid token, wrong password) and `vitest` unit tests for `src/lib/jwt.ts`/`src/lib/password.ts`. |
| 3. Alert management (user) | Done | Backend: `packages/backend/src/modules/{categories,alerts}/` (service/controller/routes, mirroring the auth module's pattern), mounted at `GET /api/categories`, `GET/POST /api/alerts`, `PATCH/DELETE /api/alerts/:id`, all `requireAuth`-gated and scoped to the logged-in user (404, not 403, on another user's alert). Duplicate category+channel alerts blocked with 409, backed by a new `@@unique([userId, categoryId, channel])` Prisma constraint. Frontend: first real app beyond the Epic 1 scaffold — `vue-router` + Pinia added; `auth`/`categories`/`alerts` Pinia stores; `src/lib/api.ts` fetch wrapper (Bearer auth, `localStorage`-persisted token); `LoginPage`/`SignupPage`/`DashboardPage`; `AuthenticatedLayout` + role-aware router guard (`meta.requiresAuth`/`meta.roles`) set up now so Epic 6's admin views slot in without rework; base UI components in `src/components/ui/`. Verified via the full Bruno collection, `npm run build` in both packages, and a scripted Playwright walkthrough of signup → create/update/remove alert → logout → login (0 console errors). See ARCHITECTURE.md for the structural detail. |
| 4. Event engine | Done | `packages/backend/src/modules/events/`: `EventSource` interface + `MockEventSource` implementation (canned per-category title/description templates, fixed per-category `sourceName`, random `severity` fallback), swappable for a real feed later via the one `eventSource` instance in `events.service.ts`. First admin-only endpoint, establishing a new `/api/admin/*` route namespace: `POST /api/admin/events/trigger` (`requireAuth` + `requireRole(Role.ADMIN)`), reusing the pre-existing `triggerMockEventSchema`/`TriggerMockEventResponse` DTOs from `packages/shared`. Response bundles `{ event, notifications: [] }` — `notifications` is a deliberate stub until Epic 5's matcher/dispatcher exists to populate it. Verified via `npm run build`, the full Bruno collection (new `bruno/admin/` folder), curl checks for 403 (non-admin), 401 (no token), 400 (invalid/missing `categoryCode`), and direct DB inspection confirming correct `categoryId`/`triggeredById`/JSON `payload`. |
| 5. Matching & dispatch | Not started | |
| 6. Admin views | Not started | |
| 7. Testing & polish | Not started | |

Status values: `Not started` / `In progress` / `Blocked` / `Done`.

## Key Design Decisions (fixed, do not re-litigate without explicit user sign-off)

- Category-based alerts only (no free-text keyword matching) in v1.
- Event data comes from a mock generator; architected behind an `EventSource` interface for future real APIs.
- Notification "sending" logs/persists instead of calling real SMTP/Slack; behind a `NotificationChannel` interface.
- One Vue app for both users and admins, gated by a `role` field and router meta.
- Prisma + SQLite for persistence.
- npm workspaces only (no Turborepo/Nx), Vitest for unit tests on the matching engine and dispatch logic.
