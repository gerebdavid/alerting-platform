<template>
  <div class="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
    <div>
      <p class="font-medium text-text">
        {{ user.email }}
        <span v-if="isSelf" class="text-sm font-normal text-text-subtle">(you)</span>
      </p>
      <label class="mt-1 flex items-center gap-2 text-sm text-text-subtle">
        <input type="checkbox" v-model="localIsActive" :disabled="isSelf" />
        Active
      </label>
    </div>
    <div class="flex items-center gap-3">
      <div class="w-32">
        <BaseSelect v-model="localRole" :options="roleOptions" :disabled="isSelf" />
      </div>
      <span class="w-24 text-sm text-text-subtle">{{ formattedDate }}</span>
      <BaseButton variant="secondary" :disabled="isSelf || !hasChanges" @click="handleSave">Save</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Role, UserResponse } from "@app/shared";
import { computed, ref, watch } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";

const props = defineProps<{ user: UserResponse; isSelf?: boolean }>();

const emit = defineEmits<{ save: [input: { role: Role; isActive: boolean }] }>();

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

const localRole = ref<string>(props.user.role);
const localIsActive = ref(props.user.isActive);

// Resync local edits whenever the underlying user data changes (e.g. a re-fetch, or this
// row's own save completing), so `hasChanges` correctly goes back to false after a save.
watch(
  () => props.user,
  (user) => {
    localRole.value = user.role;
    localIsActive.value = user.isActive;
  },
);

const hasChanges = computed(
  () => localRole.value !== props.user.role || localIsActive.value !== props.user.isActive,
);

const formattedDate = computed(() => new Date(props.user.createdAt).toLocaleDateString());

function handleSave() {
  emit("save", { role: localRole.value as Role, isActive: localIsActive.value });
}
</script>
