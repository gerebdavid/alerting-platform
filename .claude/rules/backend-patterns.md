# Backend Patterns

## Imports
- Always import internal backend files via the `~/*` alias (`~/*` -> `packages/backend/src/*`) — never a relative `./` or `../` path, even for a same-directory sibling file (e.g. `~/modules/events/event-source.js`, not `./event-source.js`).
- The one exception: `src/db/prisma.ts`'s import of the generated Prisma client (`../../generated/prisma/client.js`) must stay relative, since `generated/` lives outside `src/` and the `~` alias can't reach it.
- `@app/shared` imports use the package name, not `~` (it's a separate workspace package, not part of this package's `src/`).
- This applies everywhere in the package, including scripts outside `src/` like `prisma/seed.ts` — `tsx` resolves `~` from the nearest `tsconfig.json` regardless of where the importing file lives.
