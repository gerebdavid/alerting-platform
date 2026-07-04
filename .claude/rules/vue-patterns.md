---
description: Vue and routing implementation patterns for one-amp
globs:
  - "src/components/**/*.vue"
  - "src/pages/**/*.vue"
  - "src/layout/**/*.vue"
  - "src/router.ts"
alwaysApply: false
---

# Vue and Routing Patterns

## Components
- Prefer Composition API with clear `ref`/`computed` state separation.
- Keep presentational logic in components and move reusable logic into composables.
- Reuse base UI building blocks from `src/components/ui` first.

## Pages
- Keep pages focused on orchestration (queries, store wiring, route params), with heavy UI delegated to components.

## Routing
- Preserve nested route layout strategy used in `src/router.ts`.
- Keep route names explicit and stable.
- Add route `meta` only when behavior is consumed by layouts/nav logic.

## Imports
- Use `@/` alias imports for project files.
