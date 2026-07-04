import type { AdminUserUpdateRequest, UserResponse } from "@app/shared";
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/lib/api";

export const useAdminUsersStore = defineStore("admin-users", () => {
  const users = ref<UserResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;
    try {
      users.value = await api.get<UserResponse[]>("/api/admin/users");
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load users";
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: string, input: AdminUserUpdateRequest) {
    const updated = await api.patch<UserResponse>(`/api/admin/users/${id}`, input);
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) users.value[index] = updated;
  }

  return { users, isLoading, error, fetchUsers, updateUser };
});
