<template>
  <form class="flex flex-col gap-4 sm:flex-row sm:items-end" @submit.prevent="handleSubmit">
    <div class="flex-1">
      <BaseSelect
        v-model="categoryCode"
        label="Category"
        :options="[{ value: '', label: 'Select a category' }, ...categories.map((c) => ({ value: c.code, label: c.label }))]"
      />
    </div>
    <div class="flex-1">
      <BaseSelect
        v-model="channel"
        label="Channel"
        :options="[{ value: '', label: 'Select a channel' }, ...channelOptions]"
      />
    </div>
    <BaseButton type="submit" :disabled="isSubmitting">Add alert</BaseButton>
    <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import type { CategoryResponse, CreateAlertRequest } from "@app/shared";
import { createAlertSchema } from "@app/shared";
import { ref } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";

defineProps<{
  categories: CategoryResponse[];
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{ create: [input: CreateAlertRequest] }>();

const channelOptions = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
];

const categoryCode = ref("");
const channel = ref("");
const error = ref("");

function handleSubmit() {
  error.value = "";
  const parsed = createAlertSchema.safeParse({
    categoryCode: categoryCode.value,
    channel: channel.value,
  });
  if (!parsed.success) {
    error.value = "Pick a category and a channel";
    return;
  }
  emit("create", parsed.data);
}
</script>
