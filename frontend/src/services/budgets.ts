import { api, ApiResponse } from '../lib/api'

export interface Budget {
  id: number
  company_id: number
  category_id: number
  name: string
  amount: number
  spent: number
  remaining: number
  percentage: number
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  category: {
    id: number
    name: string
    color: string
  }
  alerts_enabled: boolean
  alert_threshold?: number
}

export interface CreateBudgetData {
  category_id: number
  name: string
  amount: number
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  alerts_enabled?: boolean
  alert_threshold?: number
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  is_active?: boolean
}

export interface BudgetFilters {
  search?: string
  category_id?: number
  period?: 'monthly' | 'quarterly' | 'yearly'
  is_active?: boolean
  status?: 'on_track' | 'warning' | 'exceeded'
  page?: number
  per_page?: number
  sort_by?: 'name' | 'amount' | 'percentage' | 'end_date'
  sort_order?: 'asc' | 'desc'
}

export const budgetsService = {
  // Get all budgets
  async getAll(filters?: BudgetFilters): Promise<ApiResponse<Budget[]>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get(`/budgets?${params.toString()}`)
  },

  // Get single budget
  async getById(id: number): Promise<ApiResponse<Budget>> {
    return api.get(`/budgets/${id}`)
  },

  // Create new budget
  async create(data: CreateBudgetData): Promise<ApiResponse<Budget>> {
    return api.post('/budgets', data)
  },

  // Update budget
  async update(id: number, data: UpdateBudgetData): Promise<ApiResponse<Budget>> {
    return api.put(`/budgets/${id}`, data)
  },

  // Delete budget
  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/budgets/${id}`)
  },

  // Get budget statistics
  async getStats(filters?: BudgetFilters): Promise<ApiResponse<{
    total_budgets: number
    total_budgeted: number
    total_spent: number
    total_remaining: number
    average_utilization: number
    exceeded_budgets: number
    warning_budgets: number
    on_track_budgets: number
    category_breakdown: Array<{
      category_id: number
      category_name: string
      budgeted: number
      spent: number
      remaining: number
      utilization: number
    }>
    period_comparison: Array<{
      period: string
      budgeted: number
      spent: number
      utilization: number
    }>
  }>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get(`/budgets/stats?${params.toString()}`)
  },

  // Get budget performance
  async getPerformance(id: number): Promise<ApiResponse<{
    daily_spending: Array<{
      date: string
      amount: number
      cumulative: number
    }>
    weekly_spending: Array<{
      week: string
      amount: number
      cumulative: number
    }>
    monthly_spending: Array<{
      month: string
      amount: number
      cumulative: number
    }>
    projections: {
      expected_end_amount: number
      days_remaining: number
      daily_average_needed: number
      daily_average_spent: number
      on_track_to_meet_budget: boolean
    }
  }>> {
    return api.get(`/budgets/${id}/performance`)
  },

  // Adjust budget amount
  async adjustAmount(id: number, newAmount: number, reason?: string): Promise<ApiResponse<Budget>> {
    return api.post(`/budgets/${id}/adjust`, {
      amount: newAmount,
      reason
    })
  },

  // Reset budget
  async reset(id: number): Promise<ApiResponse<Budget>> {
    return api.post(`/budgets/${id}/reset`)
  },

  // Clone budget
  async clone(id: number, data: Partial<CreateBudgetData>): Promise<ApiResponse<Budget>> {
    return api.post(`/budgets/${id}/clone`, data)
  },

  // Bulk operations
  async bulkActivate(ids: number[]): Promise<ApiResponse<void>> {
    return api.post('/budgets/bulk-activate', { ids })
  },

  async bulkDeactivate(ids: number[]): Promise<ApiResponse<void>> {
    return api.post('/budgets/bulk-deactivate', { ids })
  },

  async bulkDelete(ids: number[]): Promise<ApiResponse<void>> {
    return api.post('/budgets/bulk-delete', { ids })
  },

  // Export budgets
  async export(filters?: BudgetFilters, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<void> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    params.append('format', format)
    
    await api.download(`/budgets/export?${params.toString()}`, `budgets.${format}`)
  }
}
