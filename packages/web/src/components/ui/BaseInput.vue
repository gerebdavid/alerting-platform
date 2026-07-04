<template>
  <label class="block">
    <span class="mb-1 block text-sm font-medium text-text">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      class="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1 block text-sm text-danger-600">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
const { type = "text" } = defineProps<{
  modelValue: string;
  label: string;
  type?: string;
  error?: string;
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>
