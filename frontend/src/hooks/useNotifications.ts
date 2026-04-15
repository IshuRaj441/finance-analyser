import { useState, useEffect, useCallback } from 'react'
import { notificationService, Notification, NotificationFilters } from '../services/notifications'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Setup event listeners
  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    const handleNotificationsRead = (notificationIds: number[]) => {
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    }

    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)

    notificationService.on('notification', handleNotification)
    notificationService.on('notifications_read', handleNotificationsRead)
    notificationService.on('connected', handleConnected)
    notificationService.on('disconnected', handleDisconnected)

    return () => {
      notificationService.off('notification', handleNotification)
      notificationService.off('notifications_read', handleNotificationsRead)
      notificationService.off('connected', handleConnected)
      notificationService.off('disconnected', handleDisconnected)
    }
  }, [])

  const markAsRead = useCallback(async (notificationIds: number[]) => {
    await notificationService.markAsRead(notificationIds)
  }, [])

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead()
  }, [])

  const refreshNotifications = useCallback(async (filters?: NotificationFilters) => {
    setIsLoading(true)
    try {
      const response = await notificationService.getAll(filters)
      setNotifications(response.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount()
      setUnreadCount(response.data.count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  const deleteNotifications = useCallback(async (notificationIds: number[]) => {
    await notificationService.delete(notificationIds)
    setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)))
    setUnreadCount(prev => Math.max(0, prev - notificationIds.filter(id => 
      !notifications.find(n => n.id === id)?.read_at
    ).length))
  }, [notifications])

  // Initial load
  useEffect(() => {
    refreshNotifications({ per_page: 50 })
    refreshUnreadCount()
  }, [refreshNotifications, refreshUnreadCount])

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    refreshUnreadCount,
    deleteNotifications
  }
}
