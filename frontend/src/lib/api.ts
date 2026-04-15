import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  pagination?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        let token = null
        
        // Try to get token from zustand persist storage first
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          try {
            const authData = JSON.parse(authStorage)
            token = authData.state?.token
          } catch (error) {
            // Invalid token format, remove it
            localStorage.removeItem('auth-storage')
          }
        }
        
        // Fallback: try direct token storage
        if (!token) {
          token = localStorage.getItem('token')
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem('auth-storage')
          localStorage.removeItem('token')
          window.location.href = '/login'
        }

        if (error.response?.status === 429) {
          // Rate limited
          console.warn('Rate limit exceeded')
        }

        if (error.response?.status === 500) {
          // Server error - don't logout, just log it
          console.error('Server error occurred:', error.response?.data)
        }

        return Promise.reject(error)
      }
    )
  }

  // HTTP Methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data)
    return response.data
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data)
    return response.data
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url)
    return response.data
  }

  // File upload
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // File download
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Set auth token manually
  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Remove auth token
  removeToken() {
    delete this.client.defaults.headers.common['Authorization']
  }

  // Get the underlying axios instance for advanced usage
  getClient(): AxiosInstance {
    return this.client
  }
}

export const api = new ApiClient()

// Utility functions for common API patterns
export const createApiHooks = <T>(endpoint: string) => ({
  // Get all items
  useGetAll: (params?: any) => ({
    queryKey: [endpoint, params],
    queryFn: () => api.get(endpoint, params),
  }),

  // Get single item
  useGetById: (id: string | number) => ({
    queryKey: [endpoint, id],
    queryFn: () => api.get(`${endpoint}/${id}`),
  }),

  // Create item
  useCreate: () => ({
    mutationFn: (data: any) => api.post(endpoint, data),
  }),

  // Update item
  useUpdate: () => ({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      api.put(`${endpoint}/${id}`, data),
  }),

  // Delete item
  useDelete: () => ({
    mutationFn: (id: string | number) => api.delete(`${endpoint}/${id}`),
  }),
})

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.message) {
    return error.message
  }

  return 'An unexpected error occurred'
}

// Type guards
export const isApiError = (error: any): error is AxiosError => {
  return error?.isAxiosError === true
}

export const isApiSuccess = <T>(response: any): response is ApiResponse<T> => {
  return response?.success === true
}
