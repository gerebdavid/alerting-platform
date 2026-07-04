<template>
  <div>
    <nav class="mb-6 flex gap-4 border-b border-border">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-text-muted"
        active-class="border-primary-900 text-text"
      >
        {{ tab.label }}
      </router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
const tabs = [{ name: "admin-trigger-event", label: "Trigger Event" }];
</script>
