import { Role } from "@app/shared";
import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout.vue";
import AdminTriggerEventPage from "@/pages/AdminTriggerEventPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import SignupPage from "@/pages/SignupPage.vue";
import { useAuthStore } from "@/stores/auth.store";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: Role[];
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "login", component: LoginPage, meta: { requiresAuth: false } },
    { path: "/signup", name: "signup", component: SignupPage, meta: { requiresAuth: false } },
    {
      path: "/",
      component: AuthenticatedLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "", name: "dashboard", component: DashboardPage },
        {
          path: "admin",
          component: AdminLayout,
          meta: { roles: [Role.ADMIN] },
          children: [
            { path: "trigger-event", name: "admin-trigger-event", component: AdminTriggerEventPage },
            { path: "", redirect: { name: "admin-trigger-event" } },
          ],
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const allowedRoles = to.matched.flatMap((record) => record.meta.roles ?? []);

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }
  if (allowedRoles.length && !allowedRoles.includes(auth.user?.role as Role)) {
    return { name: "dashboard" };
  }
  if (!requiresAuth && auth.isAuthenticated && (to.name === "login" || to.name === "signup")) {
    return { name: "dashboard" };
  }
  return true;
});

export default router;
