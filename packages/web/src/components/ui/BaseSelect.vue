<template>
  <label class="block">
    <span v-if="label" class="mb-1 block text-sm font-medium text-text">{{ label }}</span>
    <select
      :value="modelValue"
      class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>
