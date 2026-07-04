import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { useAuthStore } from "@/stores/auth.store";

const app = createApp(App);
app.use(createPinia());
app.use(router);

const auth = useAuthStore();
auth.hydrate().finally(() => {
  app.mount("#app");
});
