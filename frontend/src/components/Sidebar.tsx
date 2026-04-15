import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard,
  Receipt,
  TrendingDown,
  PiggyBank,
  FileText,
  Bell,
  Users,
  Settings,
  LogOut,
  X,
  Building2
} from 'lucide-react'
import NotificationBell from './NotificationBell'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole: string
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Transactions', href: '/transactions', icon: Receipt, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Expenses', href: '/expenses', icon: TrendingDown, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Users', href: '/users', icon: Users, roles: ['Admin', 'Manager'], badge: null },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['Admin', 'Manager', 'Accountant', 'Employee', 'Viewer'], badge: null },
  { name: 'Companies', href: '/companies', icon: Building2, roles: ['Admin'], badge: null },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  const NavItem: React.FC<{ item: any }> = ({ item }) => {
    const isActive = location.pathname === item.href
    
    return (
      <div className="relative group">
        <NavLink
          to={item.href}
          onClick={isMobile ? onClose : undefined}
          className={`
            relative flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg
            transition-all duration-200 ease-in-out
            ${isActive 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              <item.icon className="h-5 w-5" />
            </span>
            <span className="truncate">{item.name}</span>
          </div>
          {item.badge && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
              {item.badge}
            </span>
          )}
        </NavLink>
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute right-0 top-0 bottom-0 w-0.5 bg-indigo-400 rounded-l"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -280) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-72 glass
          ${isMobile ? 'overflow-hidden' : 'overflow-y-auto'}
          scrollbar-hide lg:hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FA</span>
              </div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-white font-semibold"
              >
                Finance Analyser
              </motion.span>
            </div>
            
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {filteredNavItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <NavItem item={item} />
              </motion.div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <button
              className={`
                flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium
                text-gray-300 hover:bg-white/10 hover:text-white rounded-lg
                transition-all duration-200 ease-in-out group
              `}
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar Content */}
      <div className="hidden lg:flex lg:flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FA</span>
            </div>
            <span className="text-white font-semibold">
              Finance Analyser
            </span>
          </div>
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {filteredNavItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <NavItem item={item} />
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            className={`
              flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium
              text-gray-300 hover:bg-white/10 hover:text-white rounded-lg
              transition-all duration-200 ease-in-out group
            `}
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
