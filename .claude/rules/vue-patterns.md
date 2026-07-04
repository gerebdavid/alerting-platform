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
- Component order should be always this: 
  1. `<template>` block
  2. `<script setup>` block
  3. `<style scoped>` block
- Use the most up-to-date Vue features available in the project's installed version. In particular, for prop defaults use Vue 3.5+ reactive props destructuring (`const { x = default } = defineProps<{...}>()`) instead of `withDefaults(defineProps<...>(), {...})`.

## Pages
- Keep pages focused on orchestration (queries, store wiring, route params), with heavy UI delegated to components.

## Routing
- Preserve nested route layout strategy used in `src/router.ts`.
- Keep route names explicit and stable.
- Add route `meta` only when behavior is consumed by layouts/nav logic.

## Imports
- Use `@/` alias imports for project files.
