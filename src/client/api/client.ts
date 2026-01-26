import { $fetch } from 'ofetch'

const baseURL = 'http://localhost:3000/api'

export const api = {
  get<T>(url: string) {
    return $fetch<T>(url, {
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  post<T>(url: string, body?: any) {
    const headers: Record<string, string> = {}
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    return $fetch<T>(url, {
      baseURL,
      method: 'POST',
      body,
      headers,
    })
  },

  put<T>(url: string, body?: any) {
    return $fetch<T>(url, {
      baseURL,
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  delete<T>(url: string) {
    return $fetch<T>(url, {
      baseURL,
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
