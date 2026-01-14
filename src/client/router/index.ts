import { createRouter, createWebHistory } from 'vue-router'
import EditTrip from '../components/edit/EditTrip.vue'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/edit-trip',
    name: 'edit-trip',
    component: EditTrip,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
