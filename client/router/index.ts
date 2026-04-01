import { createRouter, createWebHistory } from "vue-router";
import HomeViewPage from "@/views/HomeViewPage.vue";
import TripDetailsPage from "../views/TripDetailsPage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import ProfilePage from "@/views/ProfilePage.vue";

import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeViewPage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { guestOnly: true }, 
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
    meta: { guestOnly: true },
  },
  {
    path: "/trips/:id",
    name: "trip-details",
    component: TripDetailsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  

  await authStore.init()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router;