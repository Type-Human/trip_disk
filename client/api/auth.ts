import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth'
import { api } from './client'

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials)
      return response
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      return response
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async logout(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/logout', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getMe(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}