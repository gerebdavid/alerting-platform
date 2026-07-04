<template>
  <p v-if="isLoading" class="text-sm text-text-subtle">Loading alerts…</p>
  <p v-else-if="!alerts.length" class="text-sm text-text-subtle">
    You don't have any alerts yet. Create one above.
  </p>
  <div v-else>
    <AlertListItem
      v-for="alert in alerts"
      :key="alert.id"
      :alert="alert"
      @update-channel="(channel) => $emit('updateChannel', alert.id, channel)"
      @toggle-enabled="(isEnabled) => $emit('toggleEnabled', alert.id, isEnabled)"
      @remove="$emit('remove', alert.id)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AlertResponse, ChannelType } from "@app/shared";
import AlertListItem from "@/components/alerts/AlertListItem.vue";

defineProps<{ alerts: AlertResponse[]; isLoading?: boolean }>();

defineEmits<{
  updateChannel: [id: string, channel: ChannelType];
  toggleEnabled: [id: string, isEnabled: boolean];
  remove: [id: string];
}>();
</script>
