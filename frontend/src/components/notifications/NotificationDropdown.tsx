import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BellSlashIcon
} from '@heroicons/react/24/outline'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'alert' | 'warning' | 'info' | 'success'
  timestamp: string
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

interface NotificationDropdownProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (ids: string[]) => void
  onMarkAllAsRead: () => void
  onDelete: (ids: string[]) => void
  className?: string
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-accent" />
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-secondary" />
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5 text-primary-400" />
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return 'border-danger/30 bg-danger/10'
      case 'warning':
        return 'border-accent/30 bg-accent/10'
      case 'success':
        return 'border-secondary/30 bg-secondary/10'
      case 'info':
      default:
        return 'border-primary-500/30 bg-primary-500/10'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead([notification.id])
    }
    if (notification.actionUrl) {
      // Handle navigation to action URL
      console.log('Navigate to:', notification.actionUrl)
    }
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map(n => n.id))
    }
  }

  const handleMarkSelectedAsRead = () => {
    const unreadSelected = selectedNotifications.filter(id => 
      !notifications.find(n => n.id === id)?.read
    )
    if (unreadSelected.length > 0) {
      onMarkAsRead(unreadSelected)
    }
    setSelectedNotifications([])
  }

  const handleDeleteSelected = () => {
    if (selectedNotifications.length > 0) {
      onDelete(selectedNotifications)
      setSelectedNotifications([])
    }
  }

  return (
    <div className={twMerge('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-surface-200/50 transition-all duration-200"
      >
        <BellIcon className="w-5 h-5 text-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 glass-strong rounded-xl shadow-2xl z-50 max-h-[500px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-surface-200/50 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-text-muted" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border/50 bg-surface-100/50 text-primary-600 focus:ring-primary-500/50"
                    />
                    <span className="text-sm text-text-secondary">Select all</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    {selectedNotifications.length > 0 && (
                      <>
                        <button
                          onClick={handleMarkSelectedAsRead}
                          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          Mark selected read
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          className="text-sm text-danger hover:text-danger-400 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BellSlashIcon className="w-12 h-12 text-text-muted mb-3" />
                    <p className="text-text-secondary">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={twMerge(
                          'p-4 hover:bg-surface-100/30 transition-colors cursor-pointer',
                          !notification.read && 'bg-surface-100/20',
                          selectedNotifications.includes(notification.id) && 'bg-primary-600/10'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotifications([...selectedNotifications, notification.id])
                              } else {
                                setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id))
                              }
                            }}
                            className="mt-1 rounded border-border/50 bg-surface-100/50 text-primary-600 focus:ring-primary-500/50"
                          />

                          {/* Icon */}
                          <div className={twMerge(
                            'w-10 h-10 rounded-full flex items-center justify-center border',
                            getTypeColor(notification.type)
                          )}>
                            {getTypeIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div
                            className="flex-1 min-w-0"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className={twMerge(
                                  'text-sm font-medium truncate',
                                  notification.read ? 'text-text-secondary' : 'text-text-primary'
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-text-muted mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-text-muted mt-2">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                              </div>

                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-2" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-border/50">
                  <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown
