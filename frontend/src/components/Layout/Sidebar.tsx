import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import {
  HomeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  UserGroupIcon,
  CogIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  roles?: string[]
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
  { name: 'Expenses', href: '/expenses', icon: CurrencyDollarIcon },
  { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon, roles: ['admin', 'manager'] },
  { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

interface SidebarProps {
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const userRole = 'admin' // This would come from auth context

  const filteredItems = sidebarItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <motion.aside
      className={twMerge(
        'glass border-r border-border/50 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-text-primary font-semibold text-lg">Finance</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-200/50 transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={twMerge(
                'group flex items-center px-3 py-2 rounded-lg transition-all duration-200',
                active
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-200/50'
              )}
            >
              <Icon className={twMerge(
                'flex-shrink-0 transition-all duration-200',
                isCollapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'
              )} />
              
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {active && !isCollapsed && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                  initial={false}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">John Doe</p>
                <p className="text-xs text-text-muted truncate">john@example.com</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

export default Sidebar
