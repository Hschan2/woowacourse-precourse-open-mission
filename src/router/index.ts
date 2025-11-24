import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import MoodSelect from "../pages/MoodSelect.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/mood", name: "MoodSelect", component: MoodSelect, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
