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
| 1. Monorepo scaffold | In progress | |
| 2. Data model & auth | Not started | |
| 3. Alert management (user) | Not started | |
| 4. Event engine | Not started | |
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
