
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  
  const openLogin = () => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }))
  }
  
  const openRegister = () => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'register' } }))
  }
  
  const handleLogin = async (login: string, password: string) => {
    return await authStore.login(login, password)
  }
  
  const handleRegister = async (username: string, email: string, password: string) => {
    return await authStore.register(username, email, password)
  }
  
  const handleLogout = async () => {
    await authStore.logout()
  }
  
  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    loading: authStore.loading,
    openLogin,
    openRegister,
    handleLogin,
    handleRegister,
    handleLogout
  }
}