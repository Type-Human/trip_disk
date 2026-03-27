export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface LoginCredentials {
  login: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}