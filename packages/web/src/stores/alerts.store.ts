import type { AlertResponse, CreateAlertRequest, UpdateAlertRequest } from "@app/shared";
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/api";

export const useAlertsStore = defineStore("alerts", () => {
  const alerts = ref<AlertResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAlerts() {
    isLoading.value = true;
    error.value = null;
    try {
      alerts.value = await api.get<AlertResponse[]>("/api/alerts");
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load alerts";
    } finally {
      isLoading.value = false;
    }
  }

  async function createAlert(input: CreateAlertRequest) {
    const alert = await api.post<AlertResponse>("/api/alerts", input);
    alerts.value.push(alert);
  }

  async function updateAlert(id: string, input: UpdateAlertRequest) {
    const alert = await api.patch<AlertResponse>(`/api/alerts/${id}`, input);
    const index = alerts.value.findIndex((a) => a.id === id);
    if (index !== -1) alerts.value[index] = alert;
  }

  async function removeAlert(id: string) {
    await api.delete(`/api/alerts/${id}`);
    alerts.value = alerts.value.filter((a) => a.id !== id);
  }

  return { alerts, isLoading, error, fetchAlerts, createAlert, updateAlert, removeAlert };
});
