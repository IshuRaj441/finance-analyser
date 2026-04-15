import { api, ApiResponse } from '../lib/api'

export interface Report {
  id: number
  company_id: number
  name: string
  type: 'financial_summary' | 'profit_loss' | 'expense_report' | 'budget_report' | 'tax_report'
  description?: string
  parameters: {
    date_from: string
    date_to: string
    categories?: number[]
    include_charts?: boolean
    include_details?: boolean
  }
  status: 'pending' | 'generating' | 'completed' | 'failed'
  file_url?: string
  file_size?: number
  generated_at?: string
  created_at: string
  updated_at: string
}

export interface CreateReportData {
  name: string
  type: 'financial_summary' | 'profit_loss' | 'expense_report' | 'budget_report' | 'tax_report'
  description?: string
  parameters: {
    date_from: string
    date_to: string
    categories?: number[]
    include_charts?: boolean
    include_details?: boolean
  }
}

export interface ReportFilters {
  search?: string
  type?: 'financial_summary' | 'profit_loss' | 'expense_report' | 'budget_report' | 'tax_report'
  status?: 'pending' | 'generating' | 'completed' | 'failed'
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
  sort_by?: 'name' | 'created_at' | 'generated_at'
  sort_order?: 'asc' | 'desc'
}

export const reportsService = {
  // Get all reports
  async getAll(filters?: ReportFilters): Promise<ApiResponse<Report[]>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get(`/reports?${params.toString()}`)
  },

  // Get single report
  async getById(id: number): Promise<ApiResponse<Report>> {
    return api.get(`/reports/${id}`)
  },

  // Generate new report
  async generate(data: CreateReportData): Promise<ApiResponse<Report>> {
    return api.post('/reports', data)
  },

  // Delete report
  async delete(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/reports/${id}`)
  },

  // Download report
  async download(id: number): Promise<void> {
    const report = await this.getById(id)
    if (report.data.file_url) {
      await api.download(report.data.file_url, `${report.data.name}.pdf`)
    }
  },

  // Get report templates
  async getTemplates(): Promise<ApiResponse<Array<{
    id: number
    name: string
    type: string
    description: string
    default_parameters: any
  }>>> {
    return api.get('/reports/templates')
  },

  // Generate report from template
  async generateFromTemplate(templateId: number, name: string, parameters: any): Promise<ApiResponse<Report>> {
    return api.post(`/reports/templates/${templateId}/generate`, {
      name,
      parameters
    })
  },

  // Get available report types
  async getTypes(): Promise<ApiResponse<Array<{
    type: string
    name: string
    description: string
    supported_formats: string[]
    default_parameters: any
  }>>> {
    return api.get('/reports/types')
  },

  // Schedule recurring report
  async schedule(data: {
    name: string
    type: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    parameters: any
    recipients: string[]
    next_run_date: string
  }): Promise<ApiResponse<{
    id: number
    name: string
    frequency: string
    next_run_date: string
    is_active: boolean
  }>> {
    return api.post('/reports/schedule', data)
  },

  // Get scheduled reports
  async getScheduled(): Promise<ApiResponse<Array<{
    id: number
    name: string
    type: string
    frequency: string
    next_run_date: string
    is_active: boolean
    last_run_date?: string
    recipients: string[]
  }>>> {
    return api.get('/reports/scheduled')
  },

  // Update scheduled report
  async updateScheduled(id: number, data: any): Promise<ApiResponse<void>> {
    return api.put(`/reports/scheduled/${id}`, data)
  },

  // Delete scheduled report
  async deleteScheduled(id: number): Promise<ApiResponse<void>> {
    return api.delete(`/reports/scheduled/${id}`)
  },

  // Get report statistics
  async getStats(): Promise<ApiResponse<{
    total_reports: number
    completed_reports: number
    pending_reports: number
    failed_reports: number
    popular_types: Array<{
      type: string
      count: number
    }>
    recent_activity: Array<{
      date: string
      reports_generated: number
    }>
  }>> {
    return api.get('/reports/stats')
  },

  // Share report
  async share(id: number, data: {
    recipients: string[]
    message?: string
    expires_at?: string
  }): Promise<ApiResponse<{
    share_url: string
    expires_at: string
  }>> {
    return api.post(`/reports/${id}/share`, data)
  },

  // Get shared report
  async getShared(shareToken: string): Promise<ApiResponse<{
    report: Report
    share_url: string
    expires_at: string
  }>> {
    return api.get(`/reports/shared/${shareToken}`)
  }
}
