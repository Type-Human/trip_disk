import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import './scss/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)


const initApp = () => {
  const authStore = useAuthStore()
  authStore.init().finally(() => {
    app.mount('#app')
  })
}

initApp()