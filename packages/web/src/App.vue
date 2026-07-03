<script setup lang="ts">
import { onMounted, ref } from "vue";

const status = ref<"loading" | "ok" | "error">("loading");

onMounted(async () => {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    status.value = data.status === "ok" ? "ok" : "error";
  } catch {
    status.value = "error";
  }
});
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
    <h1 class="text-2xl font-semibold text-slate-800">Alerts Platform</h1>
    <p class="text-sm text-slate-600">
      Backend status:
      <span
        :class="{
          'text-amber-600': status === 'loading',
          'text-green-600': status === 'ok',
          'text-red-600': status === 'error',
        }"
        class="font-medium"
      >
        {{ status }}
      </span>
    </p>
  </main>
</template>
