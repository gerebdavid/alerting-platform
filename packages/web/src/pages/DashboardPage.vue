<template>
  <div class="flex flex-col gap-6">
    <BaseCard title="Create an alert">
      <AlertForm :categories="categoriesStore.categories" @create="handleCreate" />
      <p v-if="alertsStore.error" class="mt-2 text-sm text-danger-600">{{ alertsStore.error }}</p>
    </BaseCard>

    <BaseCard title="Your alerts">
      <AlertList
        :alerts="alertsStore.alerts"
        :is-loading="alertsStore.isLoading"
        @update-channel="handleUpdateChannel"
        @toggle-enabled="handleToggleEnabled"
        @remove="handleRemove"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import type { ChannelType, CreateAlertRequest } from "@app/shared";
import { onMounted } from "vue";
import AlertForm from "@/components/alerts/AlertForm.vue";
import AlertList from "@/components/alerts/AlertList.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import { useAlertsStore } from "@/stores/alerts.store";
import { useCategoriesStore } from "@/stores/categories.store";

const alertsStore = useAlertsStore();
const categoriesStore = useCategoriesStore();

onMounted(() => {
  alertsStore.fetchAlerts();
  categoriesStore.fetchCategories();
});

async function handleCreate(input: CreateAlertRequest) {
  alertsStore.error = null;
  try {
    await alertsStore.createAlert(input);
  } catch (err) {
    alertsStore.error = err instanceof Error ? err.message : "Failed to create alert";
  }
}

async function handleUpdateChannel(id: string, channel: ChannelType) {
  await alertsStore.updateAlert(id, { channel });
}

async function handleToggleEnabled(id: string, isEnabled: boolean) {
  await alertsStore.updateAlert(id, { isEnabled });
}

async function handleRemove(id: string) {
  await alertsStore.removeAlert(id);
}
</script>
