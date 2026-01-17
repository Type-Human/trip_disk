import { createRouter, createWebHistory } from 'vue-router'
import EditTrip from '../components/edit/EditTrip.vue'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import TripDetailsPage from '../views/TripDetailsPage.vue'

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
  {
    path: '/trips/:id',
    name: 'trip-details',
    component: TripDetailsPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
