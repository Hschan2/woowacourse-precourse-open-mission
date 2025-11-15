import { createApp } from "vue";
import App from "/src/App.vue";
import router from "/src/router";
import "./assets/main.css";

createApp(App).use(router).mount("#app");
