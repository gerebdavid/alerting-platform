# Bruno API Collection

The Bruno collection at `bruno/` (open with the Bruno app, or run via `npx @usebruno/cli run <folder> --env Local`) mirrors the backend's HTTP API.

- Whenever a new Express route is implemented (or an existing route's request/response shape changes), add or update a matching `.bru` request under `bruno/`, grouped by module (e.g. `bruno/auth/`, `bruno/alerts/`).
- Follow the existing request pattern in `bruno/auth/`: `meta` block with an incrementing `seq`, `{{baseUrl}}` for the host, `body:json` for request payloads, `auth: bearer` with `{{token}}` for protected routes.
- If a route depends on a token/id produced by another request (e.g. login), use a `script:post-response` block with `bru.setVar(...)` to capture it, rather than hardcoding values — see `bruno/auth/Login.bru`.
- Verify new/changed requests actually work by running them against the local dev server before considering the route done.
