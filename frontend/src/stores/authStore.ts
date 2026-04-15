import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  company_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar?: string
  status: string
  roles: Array<{
    id: number
    name: string
  }>
  permissions: Array<{
    id: number
    name: string
  }>
  company: {
    id: number
    name: string
    slug: string
    plan: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User) => void
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  
  // Helpers
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

interface RegisterData {
  company_name: string
  company_slug: string
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem("token"),
      isLoading: false,
      isAuthenticated: !!localStorage.getItem("token"),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          let response
          
          response = await api.post('/auth/login', { email, password })
          console.log('Login response:', response.data)

          // Check if we have token and user data - FIXED: data is nested under response.data.data
          const { token, user } = response.data.data || response.data
          
          if (!token || !user) {
            throw new Error('Invalid login response: missing token or user data')
          }

          // Set token in API headers
          api.setToken(token)

          set({
            user: Array.isArray(user) ? user[0] : user, // Handle both array and object
            token: token,
            isLoading: false,
            isAuthenticated: true,
          })

          toast.success('Login successful!')
          return
        } catch (error: any) {
          set({ isLoading: false })
          console.error('Login error:', error)
          console.error('Error response:', error.response?.data)
          const message = error?.response?.data?.message || error.message || 'Login failed'
          toast.error(message)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        
        try {
          const response = await api.post('/auth/register', data)
          const { token, user } = response.data.data
          
          // Set token in API headers
          api.setToken(token)
          
          set({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          })
          
          toast.success('Registration successful!')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // Remove token from localStorage and API headers
        localStorage.removeItem("token");
        api.removeToken()
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        
        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ isLoading: false })
          return
        }
        
        set({ isLoading: true })
        
        try {
          // Set token in API headers
          api.setToken(token)
          
          let response
          
          response = await api.get('/auth/me')
          console.log('Auth check response:', response.data)
          
          // FIXED: Handle correct response structure
          let user = response.data.data || response.data
          if (Array.isArray(user) && user.length > 0) {
            user = user[0] // User is in an array
          }
          
          if (!user) {
            throw new Error('No user data found')
          }
          
          set({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } catch (error: any) {
          console.error('Auth check error:', error)
          console.error('Error response:', error.response?.data)
          
          // Only logout if truly unauthorized (401), not on server errors (500)
          if (error.response?.status === 401) {
            console.log('Token invalid - removing session')
            api.removeToken()
            set({
              user: null,
              token: null,
              isLoading: false,
              isAuthenticated: false,
            })
          } else {
            console.log('Server error - keeping session')
            set({ isLoading: false })
          }
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await api.put('/auth/profile', data)
          const updatedUser = response.data.data
          
          set({ user: updatedUser })
          toast.success('Profile updated successfully!')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          throw error
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await api.put('/auth/change-password', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPassword,
          })
          
          toast.success('Password changed successfully!')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Password change failed'
          toast.error(message)
          throw error
        }
      },

      hasRole: (role: string) => {
        const { user } = get()
        return user?.roles.some(r => r.name === role) || false
      },

      hasPermission: (permission: string) => {
        const { user } = get()
        return user?.permissions.some(p => p.name === permission) || false
      },

      hasAnyRole: (roles: string[]) => {
        const { user } = get()
        return user?.roles.some(r => roles.includes(r.name)) || false
      },

      hasAnyPermission: (permissions: string[]) => {
        const { user } = get()
        return user?.permissions.some(p => permissions.includes(p.name)) || false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
