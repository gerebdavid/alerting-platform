import router from "@/router";
import { useAuthStore } from "@/stores/auth.store";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = useAuthStore();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const hasToken = !!auth.token;
  if (auth.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // A 401 on a request that carried a token means the session itself is invalid
    // (expired/tampered/revoked) — force a logout instead of leaving stale state around.
    // A 401 with no token attached (e.g. bad login credentials) is just a normal error.
    if (res.status === 401 && hasToken) {
      auth.logout();
      if (router.currentRoute.value.name !== "login") {
        router.push({ name: "login" });
      }
    }
    throw new ApiError(res.status, body?.error ?? `Request failed with status ${res.status}`);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
};
