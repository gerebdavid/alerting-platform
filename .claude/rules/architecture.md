# Architecture Doc

`ARCHITECTURE.md` (repo root) is the structural map of the codebase — how packages, modules, and requests connect. It is not a progress tracker (that's `SCOPE.md`).

- Read `ARCHITECTURE.md` before making any non-trivial code change, so new code fits the existing request lifecycle, module pattern, and package boundaries instead of reinventing them.
- After a change that adds/removes a module, endpoint, package, dependency between packages, data-flow step, or otherwise alters how parts of the system connect, update the relevant section of `ARCHITECTURE.md` in the same piece of work — don't defer it.
- Skip the update only for changes that don't affect structure (bug fixes, copy/style tweaks, internal refactors within a single file) — use judgment, don't pad the doc with noise.
