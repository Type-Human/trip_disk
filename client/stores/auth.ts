import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import type { User } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)


  if (typeof window !== 'undefined') {
    window.addEventListener('auth:unauthorized', () => {
      logout()
    })
  }

  const init = async () => {
    if (token.value) {
      loading.value = true
      try {
        const response = await authApi.getMe(token.value)
        if (response.success && response.user) {
          user.value = response.user
        } else {
          logout()
        }
      } catch (error) {
        logout()
      } finally {
        loading.value = false
      }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    loading.value = true
    try {
      const response = await authApi.register({ username, email, password })
      if (response.success) {
        return { success: true, user: response.user }
      }
      return { success: false, error: response.error }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const login = async (login: string, password: string) => {
    loading.value = true
    try {
      const response = await authApi.login({ login, password })
      if (response.success && response.token && response.user) {
        token.value = response.token
        user.value = response.user
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    if (token.value) {
      await authApi.logout(token.value)
    }
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    init,
    register,
    login,
    logout
  }
})