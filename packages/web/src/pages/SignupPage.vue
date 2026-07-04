<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

const email = ref("");
const password = ref("");
const error = ref("");
const isSubmitting = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  error.value = "";
  isSubmitting.value = true;
  try {
    await auth.signup({ email: email.value, password: password.value });
    await router.push({ name: "dashboard" });
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Something went wrong";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto mt-16 max-w-sm">
    <BaseCard title="Sign up">
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseInput v-model="email" label="Email" type="email" />
        <BaseInput v-model="password" label="Password" type="password" />
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <BaseButton type="submit" :disabled="isSubmitting">Sign up</BaseButton>
      </form>
      <p class="mt-4 text-sm text-slate-600">
        Already have an account?
        <router-link :to="{ name: 'login' }" class="font-medium text-slate-900 underline">
          Log in
        </router-link>
      </p>
    </BaseCard>
  </div>
</template>
