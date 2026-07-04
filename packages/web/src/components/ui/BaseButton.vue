<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
    type?: "button" | "submit";
  }>(),
  { variant: "primary", disabled: false, type: "button" },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-slate-900 text-white hover:bg-slate-700': variant === 'primary',
      'bg-slate-100 text-slate-800 hover:bg-slate-200': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-500': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
