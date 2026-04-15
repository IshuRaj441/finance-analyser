import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Notification } from '../services/notifications'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  autoClose?: boolean
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoClose = true
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-danger-400" />
      default:
        return <Info className="h-5 w-5 text-primary-400" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-success-500/10 border-success-500/30'
      case 'warning':
        return 'bg-warning-500/10 border-warning-500/30'
      case 'error':
        return 'bg-danger-500/10 border-danger-500/30'
      default:
        return 'bg-primary-500/10 border-primary-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        relative flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm
        shadow-lg max-w-md cursor-pointer group
        ${getBgColor()}
      `}
      onClick={onClose}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white mb-1">
          {notification.title}
        </h4>
        <p className="text-sm text-gray-300 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.created_at).toLocaleTimeString()}
        </p>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Auto-close progress bar */}
      {autoClose && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
        />
      )}
    </motion.div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: number) => void
  onMarkAsRead: (ids: number[]) => void
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove,
  onMarkAsRead
}) => {
  const handleClose = (notification: Notification) => {
    onRemove(notification.id)
    if (!notification.read_at) {
      onMarkAsRead([notification.id])
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 5).map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              notification={notification}
              onClose={() => handleClose(notification)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default NotificationToast
