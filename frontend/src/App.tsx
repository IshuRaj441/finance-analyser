import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import { useSocketEvents } from '@/hooks/useSocketEvents'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Categories from '@/pages/Categories'
import Budgets from '@/pages/Budgets'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'
import Expenses from '@/pages/Expenses'
import Notifications from '@/pages/Notifications'
import Users from '@/pages/Users'
import Companies from '@/pages/Companies'
import AuditLogs from '@/pages/admin/AuditLogs'
import NotFound from '@/pages/NotFound'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AIAssistant from '@/components/AIAssistant'
import { api } from '@/lib/api'
import socketService from '@/services/socketService'

const ProtectedRoute = () => {
  const { token, user, isLoading } = useAuthStore()
  
  // still checking auth
  if (token && !user && !isLoading) {
    return <div className="p-10">Loading...</div>
  }
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

function App() {
  const { token, setUser, logout, isLoading, user } = useAuthStore()
  
  // Set up socket event listeners
  useSocketEvents()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!token) return;

        const res = await api.get("/auth/me");
        setUser(res.data); // restores user after refresh
      } catch (err: any) {
        console.error("Auth check failed:", err);
        // Only logout if truly unauthorized (401), not on server errors (500)
        if (err.response?.status === 401) {
          console.log("Session expired - logging out");
          logout();
        } else {
          console.log("Server error - keeping session");
        }
      }
    };

    checkAuth();
  }, [token, setUser, logout])

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (token && user) {
      socketService.connect(token);
    }

    // Cleanup socket on logout
    return () => {
      socketService.disconnect();
    };
  }, [token, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/forgot-password"
          element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected routes with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="companies" element={<Companies />} />
            <Route path="admin/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* AI Assistant */}
      {user && <AIAssistant />}
    </>
  )
}

export default App
