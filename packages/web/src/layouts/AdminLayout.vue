<template>
  <div class="flex items-start gap-8">
    <aside class="w-56 shrink-0 rounded-lg border border-border bg-surface p-4">
      <nav class="flex flex-col gap-1">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-secondary-100"
          active-class="bg-secondary-100 text-text"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </aside>
    <div class="min-w-0 flex-1">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  { name: "admin-trigger-event", label: "Trigger Event" },
  { name: "admin-users", label: "Users" },
];
</script>
