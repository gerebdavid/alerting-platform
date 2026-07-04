<template>
  <div class="min-h-screen bg-background">
    <header class="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <span class="text-lg font-semibold text-text">Alerts Platform</span>
      <div class="flex items-center gap-4">
        <span class="text-sm text-text-muted">{{ auth.user?.email }}</span>
        <BaseButton variant="secondary" @click="handleLogout">Logout</BaseButton>
      </div>
    </header>
    <main class="mx-auto max-w-3xl px-6 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";
import { useAuthStore } from "@/stores/auth.store";

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  auth.logout();
  await router.push({ name: "login" });
}
</script>
