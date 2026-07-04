<template>
  <div class="rounded-lg border border-border bg-surface p-6 shadow-sm">
    <h2 v-if="title" class="mb-4 text-lg font-semibold text-text">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>
