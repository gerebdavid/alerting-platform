import type { TriggerMockEventRequest, TriggerMockEventResponse } from "@app/shared";
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/api";

export const useAdminEventsStore = defineStore("admin-events", () => {
  const isTriggering = ref(false);
  const error = ref<string | null>(null);
  const lastResult = ref<TriggerMockEventResponse | null>(null);

  async function triggerEvent(input: TriggerMockEventRequest) {
    isTriggering.value = true;
    error.value = null;
    try {
      lastResult.value = await api.post<TriggerMockEventResponse>("/api/admin/events/trigger", input);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to trigger event";
    } finally {
      isTriggering.value = false;
    }
  }

  return { isTriggering, error, lastResult, triggerEvent };
});
