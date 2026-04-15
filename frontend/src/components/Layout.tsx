import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, User } from 'lucide-react'
import Sidebar from './Sidebar'
import NotificationBell from './NotificationBell'
import { useAuthStore } from '../stores/authStore'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()
  const location = useLocation()

  // Get the primary role of the user
  const userRole = user?.roles?.[0]?.name || 'Viewer'

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  }

  return (
    <div className="flex h-screen bg-[#0B0F14] text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          userRole={userRole}
        />
      </aside>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, categories, reports..."
                className="w-full max-w-md bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <NotificationBell />

            {/* User avatar */}
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
