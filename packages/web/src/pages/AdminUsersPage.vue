<template>
  <BaseCard title="Users">
    <AdminUserList
      :users="adminUsersStore.users"
      :is-loading="adminUsersStore.isLoading"
      :current-user-id="authStore.user?.id"
      @save="handleSave"
    />
    <p v-if="adminUsersStore.error" class="mt-2 text-sm text-danger-600">{{ adminUsersStore.error }}</p>
  </BaseCard>
</template>

<script setup lang="ts">
import type { AdminUserUpdateRequest } from "@app/shared";
import { onMounted } from "vue";
import AdminUserList from "@/components/admin/AdminUserList.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import { useAdminUsersStore } from "@/stores/admin-users.store";
import { useAuthStore } from "@/stores/auth.store";

const adminUsersStore = useAdminUsersStore();
const authStore = useAuthStore();

onMounted(() => {
  adminUsersStore.fetchUsers();
});

async function handleSave(id: string, input: AdminUserUpdateRequest) {
  adminUsersStore.error = null;
  try {
    await adminUsersStore.updateUser(id, input);
  } catch (err) {
    adminUsersStore.error = err instanceof Error ? err.message : "Failed to update user";
  }
}
</script>
