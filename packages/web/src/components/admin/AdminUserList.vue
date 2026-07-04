<template>
  <p v-if="isLoading" class="text-sm text-text-subtle">Loading users…</p>
  <p v-else-if="!users.length" class="text-sm text-text-subtle">No users found.</p>
  <div v-else>
    <AdminUserListItem
      v-for="user in users"
      :key="user.id"
      :user="user"
      :is-self="user.id === currentUserId"
      @save="(input) => $emit('save', user.id, input)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminUserUpdateRequest, UserResponse } from "@app/shared";
import AdminUserListItem from "@/components/admin/AdminUserListItem.vue";

defineProps<{ users: UserResponse[]; isLoading?: boolean; currentUserId?: string }>();

defineEmits<{ save: [id: string, input: AdminUserUpdateRequest] }>();
</script>
