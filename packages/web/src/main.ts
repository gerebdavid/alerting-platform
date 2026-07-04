import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { useAuthStore } from "@/stores/auth.store";

const app = createApp(App);
app.use(createPinia());

const auth = useAuthStore();
// Router installation kicks off its initial navigation (and beforeEach guards) immediately,
// independent of app.mount() timing — so it must wait until hydrate() has populated auth.user,
// or a hard reload on a role-gated route (e.g. /admin/*) sees a null role and gets redirected
// away before the real user data ever loads.
auth.hydrate().finally(() => {
  app.use(router);
  app.mount("#app");
});
