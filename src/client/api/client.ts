const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://155.212.171.181/api'

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: RequestInit,
): Promise<T> {
  try {
    const requestConfig = config || {}
    const headers: Record<string, string> = {
      ...(requestConfig.headers as Record<string, string> || {}),
    }

    let body: any = null

    if (data instanceof FormData) {
      body = data
    }
    else if (data) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(data)
    }

    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers,
      body,
      ...requestConfig,
    })

    if (!response.ok) {
      let errorMessage = 'Ошибка сервера'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      }
      catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      console.error(`API Error ${response.status}:`, errorMessage)
      throw new Error(errorMessage)
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T
    }

    return await response.text() as unknown as T
  }
  catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network Error:', error.message)
      throw new Error('Ошибка сети. Проверьте соединение.')
    }
    throw error
  }
}

export const api = {

  get: <T>(url: string, config?: RequestInit): Promise<T> =>
    request<T>('GET', url, null, config),

  post: <T>(url: string, data?: any, config?: RequestInit): Promise<T> =>
    request<T>('POST', url, data, config),

  put: <T>(url: string, data?: any, config?: RequestInit): Promise<T> =>
    request<T>('PUT', url, data, config),

  delete: <T>(url: string, config?: RequestInit): Promise<T> =>
    request<T>('DELETE', url, null, config),

  patch: <T>(url: string, data?: any, config?: RequestInit): Promise<T> =>
    request<T>('PATCH', url, data, config),
  upload: <T>(url: string, formData: FormData, config?: RequestInit): Promise<T> =>
    request<T>('POST', url, formData, config),
}
