<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    type?: string;
    error?: string;
  }>(),
  { type: "text" },
);

defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <label class="block">
    <span class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1 block text-sm text-red-600">{{ error }}</span>
  </label>
</template>
