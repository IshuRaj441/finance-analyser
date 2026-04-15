import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role } from '@/hooks/usePermissions'

interface User {
  id: string
  name: string
  email: string
  role: Role
  companyId?: string
  avatar?: string
}

interface RBACState {
  user: User | null
  currentCompany: string | null
  setUser: (user: User | null) => void
  setCurrentCompany: (companyId: string | null) => void
  logout: () => void
  hasRole: (role: Role) => boolean
  isAtLeastRole: (minimumRole: Role) => boolean
}

const roleHierarchy: Record<Role, number> = {
  viewer: 1,
  employee: 2,
  accountant: 3,
  manager: 4,
  admin: 5,
}

export const useRBACStore = create<RBACState>()(
  persist(
    (set, get) => ({
      user: null,
      currentCompany: null,

      setUser: (user) => set({ user }),

      setCurrentCompany: (companyId) => set({ currentCompany: companyId }),

      logout: () => set({ user: null, currentCompany: null }),

      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      isAtLeastRole: (minimumRole) => {
        const { user } = get()
        if (!user) return false
        
        const userLevel = roleHierarchy[user.role]
        const requiredLevel = roleHierarchy[minimumRole]
        
        return userLevel >= requiredLevel
      },
    }),
    {
      name: 'rbac-storage',
      partialize: (state) => ({
        user: state.user,
        currentCompany: state.currentCompany,
      }),
    }
  )
)
