import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

interface Notification {
  id: string
  title: string
  message: string
  type: 'alert' | 'warning' | 'info' | 'success'
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Budget Alert',
    message: 'Marketing budget exceeded by 15%',
    type: 'alert',
    time: '2 hours ago',
    read: false
  },
  {
    id: '2',
    title: 'New Transaction',
    message: 'Payment received from Client ABC',
    type: 'success',
    time: '5 hours ago',
    read: false
  },
  {
    id: '3',
    title: 'Report Ready',
    message: 'Monthly financial report is ready for review',
    type: 'info',
    time: '1 day ago',
    read: true
  }
]

const mockCompanies = [
  { id: '1', name: 'Tech Corp Inc.', logo: 'TC' },
  { id: '2', name: 'Finance Solutions Ltd.', logo: 'FS' },
  { id: '3', name: 'Global Enterprises', logo: 'GE' }
]

interface NavbarProps {
  className?: string
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0])

  const unreadCount = mockNotifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <div className="w-2 h-2 bg-danger rounded-full" />
      case 'warning':
        return <div className="w-2 h-2 bg-accent rounded-full" />
      case 'success':
        return <div className="w-2 h-2 bg-secondary rounded-full" />
      default:
        return <div className="w-2 h-2 bg-primary-500 rounded-full" />
    }
  }

  return (
    <header className={twMerge('glass border-b border-border/50', className)}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search transactions, reports, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-100/50 border border-border/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Company Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">{selectedCompany.logo}</span>
              </div>
              <span className="text-text-primary text-sm font-medium hidden sm:block">
                {selectedCompany.name}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-text-muted" />
            </button>

            <AnimatePresence>
              {showCompanySwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 glass-strong rounded-xl shadow-2xl z-50"
                >
                  <div className="p-2">
                    {mockCompanies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => {
                          setSelectedCompany(company)
                          setShowCompanySwitcher(false)
                        }}
                        className={twMerge(
                          'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
                          selectedCompany.id === company.id
                            ? 'bg-primary-600/20 text-primary-400'
                            : 'hover:bg-surface-200/50 text-text-primary'
                        )}
                      >
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{company.logo}</span>
                        </div>
                        <span className="text-sm font-medium">{company.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200"
            >
              <BellIcon className="w-5 h-5 text-text-muted" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 glass-strong rounded-xl shadow-2xl z-50"
                >
                  <div className="p-4 border-b border-border/50">
                    <h3 className="text-text-primary font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={twMerge(
                          'p-4 border-b border-border/30 hover:bg-surface-200/30 transition-colors duration-200',
                          !notification.read && 'bg-surface-100/20'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">
                              {notification.title}
                            </p>
                            <p className="text-sm text-text-muted truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-text-muted" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 glass-strong rounded-xl shadow-2xl z-50"
                >
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200 text-text-primary">
                      <UserCircleIcon className="w-5 h-5 text-text-muted" />
                      <span className="text-sm">Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200 text-text-primary">
                      <Cog6ToothIcon className="w-5 h-5 text-text-muted" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <div className="border-t border-border/50 my-2" />
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200 text-danger">
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
