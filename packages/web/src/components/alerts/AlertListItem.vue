<template>
  <div class="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
    <div>
      <p class="font-medium text-text">{{ alert.categoryLabel }}</p>
      <label class="mt-1 flex items-center gap-2 text-sm text-text-subtle">
        <input
          type="checkbox"
          :checked="alert.isEnabled"
          @change="emit('toggleEnabled', ($event.target as HTMLInputElement).checked)"
        />
        Enabled
      </label>
    </div>
    <div class="flex items-center gap-3">
      <div class="w-32">
        <BaseSelect
          :model-value="alert.channel"
          :options="channelOptions"
          @update:model-value="emit('updateChannel', $event as ChannelType)"
        />
      </div>
      <BaseButton variant="danger" @click="handleRemove">Remove</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AlertResponse, ChannelType } from "@app/shared";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";

defineProps<{ alert: AlertResponse }>();

const emit = defineEmits<{
  updateChannel: [channel: ChannelType];
  toggleEnabled: [isEnabled: boolean];
  remove: [];
}>();

const channelOptions = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
];

function handleRemove() {
  if (confirm("Remove this alert?")) {
    emit("remove");
  }
}
</script>
