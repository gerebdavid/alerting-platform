---
description: Prisma migrations are create-only; no automatic apply; database structure changes only as last resort.
globs: prisma/**/*
alwaysApply: false
---

# Prisma Migrations and Schema

- **Never apply migrations automatically.** Do not run `prisma migrate dev` (apply), `prisma migrate deploy`, or similar in scripts, hooks, or agent-driven flows unless the user explicitly asks to run them for a specific environment they control.
- **New migration files: create-only.** Use `npx prisma migrate dev --create-only --name <migration-name>` (or the project’s documented equivalent) so SQL is generated for review. Do not instruct applying migrations to shared, staging, or production databases from automated assistance.
- **Avoid changing the database structure** (schema, tables, columns, indexes) unless there is **no reasonable alternative** (e.g. new persisted data the app cannot store otherwise, required integrity constraints, or performance that cannot be addressed in application code or queries).
- Prefer alternatives first: application defaults, DTO shaping, existing columns, query changes, or documented views/patterns before altering `schema.prisma`.
- When a schema change is unavoidable, document **why** no other approach worked and keep the migration SQL reviewable (create-only output).
