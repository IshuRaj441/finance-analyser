import { api, ApiResponse } from '../lib/api'

export interface Transaction {
  id: number
  company_id: number
  category_id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  status: 'pending' | 'completed' | 'failed'
  notes?: string
  attachments?: string[]
  created_at: string
  updated_at: string
  category: {
    id: number
    name: string
    color: string
  }
}

export interface CreateTransactionData {
  category_id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  notes?: string
  attachments?: File[]
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  status?: 'pending' | 'completed' | 'failed'
}

export interface TransactionFilters {
  search?: string
  type?: 'income' | 'expense'
  category_id?: number
  status?: 'pending' | 'completed' | 'failed'
  date_from?: string
  date_to?: string
  min_amount?: number
  max_amount?: number
  page?: number
  per_page?: number
  sort_by?: 'date' | 'amount' | 'description'
  sort_order?: 'asc' | 'desc'
}

export const transactionsService = {
  // Get all transactions with filters
  async getAll(filters?: TransactionFilters): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get(`/transactions?${params.toString()}`)
  },

  // Get single transaction
  async getById(id: number): Promise<ApiResponse<Transaction>> {
    return api.get(`/transactions/${id}`)
  },

  // Create new transaction
  async create(data: CreateTransactionData): Promise<ApiResponse<Transaction>> {
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData()
      
      // Add all other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'attachments') {
          formData.append(key, value.toString())
        }
      })
      
      // Add files
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file)
      })
      
      return api.post('/transactions', formData)
    }
    
    return api.post('/transactions', data)
  },

  // Update transaction
  async update(id: number, data: UpdateTransactionData): Promise<ApiResponse<Transaction>> {
    return api.put(`/transactions/${id}`, data)
  },

  // Delete transaction
  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/transactions/${id}`)
  },

  // Bulk operations
  async bulkDelete(ids: number[]): Promise<ApiResponse<void>> {
    return api.post('/transactions/bulk-delete', { ids })
  },

  async bulkUpdate(ids: number[], data: UpdateTransactionData): Promise<ApiResponse<Transaction[]>> {
    return api.post('/transactions/bulk-update', { ids, data })
  },

  // Export transactions
  async export(filters?: TransactionFilters, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<void> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    params.append('format', format)
    
    await api.download(`/transactions/export?${params.toString()}`, `transactions.${format}`)
  },

  // Transaction statistics
  async getStats(filters?: TransactionFilters): Promise<ApiResponse<{
    total_income: number
    total_expenses: number
    net_amount: number
    transaction_count: number
    average_transaction: number
    category_breakdown: Array<{
      category_id: number
      category_name: string
      total_amount: number
      transaction_count: number
      percentage: number
    }>
    monthly_trend: Array<{
      month: string
      income: number
      expenses: number
      net: number
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
    
    return api.get(`/transactions/stats?${params.toString()}`)
  },

  // Upload attachment
  async uploadAttachment(transactionId: number, file: File): Promise<ApiResponse<{
    id: string
    filename: string
    url: string
    size: number
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post(`/transactions/${transactionId}/attachments`, formData)
  },

  // Delete attachment
  async deleteAttachment(transactionId: number, attachmentId: string): Promise<ApiResponse<void>> {
    return api.delete(`/transactions/${transactionId}/attachments/${attachmentId}`)
  }
}
