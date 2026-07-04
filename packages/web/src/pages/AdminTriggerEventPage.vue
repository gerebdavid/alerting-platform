<template>
  <div class="flex flex-col gap-6">
    <BaseCard title="Trigger a mock event">
      <form class="flex flex-col gap-4 sm:flex-row sm:items-end" @submit.prevent="handleSubmit">
        <div class="flex-1">
          <BaseSelect
            v-model="categoryCode"
            label="Category"
            :options="[{ value: '', label: 'Select a category' }, ...categoriesStore.categories.map((c) => ({ value: c.code, label: c.label }))]"
          />
        </div>
        <div class="flex-1">
          <BaseSelect v-model="severity" label="Severity" :options="severityOptions" />
        </div>
        <BaseButton type="submit" :disabled="adminEventsStore.isTriggering">Trigger event</BaseButton>
      </form>
      <p v-if="formError" class="mt-2 text-sm text-danger-600">{{ formError }}</p>
      <p v-if="adminEventsStore.error" class="mt-2 text-sm text-danger-600">{{ adminEventsStore.error }}</p>
    </BaseCard>

    <BaseCard v-if="adminEventsStore.lastResult" title="Result">
      <div class="mb-4">
        <p class="font-medium text-text">{{ adminEventsStore.lastResult.event.title }}</p>
        <p class="text-sm text-text-muted">{{ adminEventsStore.lastResult.event.description }}</p>
        <p class="mt-1 text-sm text-text-subtle">
          {{ adminEventsStore.lastResult.event.categoryLabel }} ·
          {{ adminEventsStore.lastResult.event.severity }} ·
          {{ adminEventsStore.lastResult.event.sourceName }}
        </p>
      </div>

      <p v-if="!adminEventsStore.lastResult.notifications.length" class="text-sm text-text-subtle">
        No alerts matched this category — no notifications were sent.
      </p>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="notification in adminEventsStore.lastResult.notifications"
          :key="notification.id"
          class="flex items-center justify-between border-b border-border py-2 last:border-b-0"
        >
          <div>
            <p class="text-sm text-text">{{ notification.userEmail }}</p>
            <p class="text-sm text-text-subtle">{{ notification.channel }} · {{ notification.detail }}</p>
          </div>
          <span
            class="text-sm font-medium"
            :class="notification.status === 'sent' ? 'text-primary-900' : 'text-danger-600'"
          >
            {{ notification.status }}
          </span>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { triggerMockEventSchema } from "@app/shared";
import { onMounted, ref } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import { useAdminEventsStore } from "@/stores/admin-events.store";
import { useCategoriesStore } from "@/stores/categories.store";

const categoriesStore = useCategoriesStore();
const adminEventsStore = useAdminEventsStore();

onMounted(() => {
  categoriesStore.fetchCategories();
});

const severityOptions = [
  { value: "", label: "Random" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const categoryCode = ref("");
const severity = ref("");
const formError = ref("");

function handleSubmit() {
  formError.value = "";
  const parsed = triggerMockEventSchema.safeParse({
    categoryCode: categoryCode.value,
    severity: severity.value || undefined,
  });
  if (!parsed.success) {
    formError.value = "Pick a category to trigger an event for";
    return;
  }
  adminEventsStore.triggerEvent(parsed.data);
}
</script>
