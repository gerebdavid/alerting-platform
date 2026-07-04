<template>
  <button
    :type="type"
    :disabled="disabled"
    class="rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-primary-900 text-white hover:bg-primary-700': variant === 'primary',
      'bg-secondary-100 text-text hover:bg-secondary-200': variant === 'secondary',
      'bg-danger-600 text-white hover:bg-danger-500': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const {
  variant = "primary",
  disabled = false,
  type = "button",
} = defineProps<{
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}>();
</script>
