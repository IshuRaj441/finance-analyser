import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Company {
  id: string
  name: string
  logo?: string
  domain?: string
  plan: 'free' | 'pro' | 'enterprise'
  users: number
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastActive: string
  settings?: {
    timezone: string
    currency: string
    dateFormat: string
  }
}

interface CompanyState {
  companies: Company[]
  currentCompany: Company | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCompanies: (companies: Company[]) => void
  setCurrentCompany: (company: Company) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  removeCompany: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      currentCompany: null,
      isLoading: false,
      error: null,

      setCompanies: (companies) => set({ companies }),

      setCurrentCompany: (company) => {
        set({ currentCompany: company })
        // Store in localStorage for immediate access
        localStorage.setItem('currentCompanyId', company.id)
      },

      addCompany: (company) => set((state) => ({
        companies: [...state.companies, company]
      })),

      updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map(company =>
          company.id === id ? { ...company, ...updates } : company
        ),
        currentCompany: state.currentCompany?.id === id 
          ? { ...state.currentCompany, ...updates }
          : state.currentCompany
      })),

      removeCompany: (id) => set((state) => ({
        companies: state.companies.filter(company => company.id !== id),
        currentCompany: state.currentCompany?.id === id ? null : state.currentCompany
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null })
    }),
    {
      name: 'company-storage',
      partialize: (state) => ({
        companies: state.companies,
        currentCompany: state.currentCompany
      })
    }
  )
)

// Hook for initializing current company from localStorage
export const useInitializeCurrentCompany = () => {
  const { companies, setCurrentCompany } = useCompanyStore()

  React.useEffect(() => {
    const storedCompanyId = localStorage.getItem('currentCompanyId')
    if (storedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.id === storedCompanyId)
      if (company) {
        setCurrentCompany(company)
      } else if (companies.length > 0) {
        // Fallback to first company if stored company not found
        setCurrentCompany(companies[0])
      }
    } else if (companies.length > 0) {
      // Set first company as default if no stored company
      setCurrentCompany(companies[0])
    }
  }, [companies, setCurrentCompany])
}
