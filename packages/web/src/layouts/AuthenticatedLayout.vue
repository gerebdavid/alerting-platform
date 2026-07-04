<template>
  <div class="min-h-screen bg-background">
    <header class="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <span class="text-lg font-semibold text-text">Alerts Platform</span>
      <div class="flex items-center gap-4">
        <router-link
          v-if="auth.isAdmin"
          :to="isOnAdminSide ? { name: 'dashboard' } : { name: 'admin-trigger-event' }"
          class="text-sm font-medium text-text-muted hover:text-text"
        >
          {{ isOnAdminSide ? "← Dashboard" : "Admin" }}
        </router-link>
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
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";
import { useAuthStore } from "@/stores/auth.store";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isOnAdminSide = computed(() => route.path.startsWith("/admin"));

async function handleLogout() {
  auth.logout();
  await router.push({ name: "login" });
}
</script>
