import type { AuthResponse, LoginRequest, SignupRequest, UserResponse } from "@app/shared";
import { Role } from "@app/shared";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { api } from "@/lib/api";

const TOKEN_STORAGE_KEY = "auth_token";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const user = ref<UserResponse | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === Role.ADMIN);

  function setSession(res: AuthResponse) {
    token.value = res.token;
    user.value = res.user;
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  async function login(payload: LoginRequest) {
    setSession(await api.post<AuthResponse>("/api/auth/login", payload));
  }

  async function signup(payload: SignupRequest) {
    setSession(await api.post<AuthResponse>("/api/auth/signup", payload));
  }

  async function hydrate() {
    if (!token.value) return;
    try {
      user.value = await api.get<UserResponse>("/api/auth/me");
    } catch {
      // api.ts already logs out and redirects on a 401 from an authenticated request;
      // any other failure here just leaves `user` unset.
    }
  }

  return { token, user, isAuthenticated, isAdmin, login, signup, logout, hydrate };
});
