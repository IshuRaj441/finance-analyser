import { api, ApiResponse } from '../lib/api'

export interface Category {
  id: number
  company_id: number
  name: string
  description?: string
  color: string
  icon?: string
  type: 'income' | 'expense'
  is_active: boolean
  budget_limit?: number
  created_at: string
  updated_at: string
  transaction_count?: number
  total_amount?: number
}

export interface CreateCategoryData {
  name: string
  description?: string
  color: string
  icon?: string
  type: 'income' | 'expense'
  budget_limit?: number
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  is_active?: boolean
}

export interface CategoryFilters {
  search?: string
  type?: 'income' | 'expense'
  is_active?: boolean
  page?: number
  per_page?: number
  sort_by?: 'name' | 'created_at' | 'transaction_count' | 'total_amount'
  sort_order?: 'asc' | 'desc'
}

export const categoriesService = {
  // Get all categories
  async getAll(filters?: CategoryFilters): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get(`/categories?${params.toString()}`)
  },

  // Get single category
  async getById(id: number): Promise<ApiResponse<Category>> {
    return api.get(`/categories/${id}`)
  },

  // Create new category
  async create(data: CreateCategoryData): Promise<ApiResponse<Category>> {
    return api.post('/categories', data)
  },

  // Update category
  async update(id: number, data: UpdateCategoryData): Promise<ApiResponse<Category>> {
    return api.put(`/categories/${id}`, data)
  },

  // Delete category
  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/categories/${id}`)
  },

  // Get category statistics
  async getStats(id: number): Promise<ApiResponse<{
    transaction_count: number
    total_amount: number
    average_amount: number
    monthly_trend: Array<{
      month: string
      amount: number
      count: number
    }>
    recent_transactions: Array<{
      id: number
      description: string
      amount: number
      date: string
    }>
  }>> {
    return api.get(`/categories/${id}/stats`)
  },

  // Get popular categories
  async getPopular(type?: 'income' | 'expense', limit: number = 10): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    params.append('limit', limit.toString())
    
    return api.get(`/categories/popular?${params.toString()}`)
  },

  // Merge categories
  async merge(sourceId: number, targetId: number): Promise<ApiResponse<void>> {
    return api.post(`/categories/${sourceId}/merge`, { target_category_id: targetId })
  },

  // Duplicate category
  async duplicate(id: number, data: Partial<CreateCategoryData>): Promise<ApiResponse<Category>> {
    return api.post(`/categories/${id}/duplicate`, data)
  },

  // Reorder categories
  async reorder(categoryIds: number[]): Promise<ApiResponse<void>> {
    return api.post('/categories/reorder', { category_ids: categoryIds })
  },

  // Import categories
  async import(file: File): Promise<ApiResponse<{
    imported: number
    skipped: number
    errors: string[]
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/categories/import', formData)
  },

  // Export categories
  async export(format: 'csv' | 'json' = 'csv'): Promise<void> {
    await api.download(`/categories/export?format=${format}`, `categories.${format}`)
  }
}
