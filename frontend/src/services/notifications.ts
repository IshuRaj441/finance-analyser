import { io, Socket } from 'socket.io-client'
import { api, ApiResponse } from '../lib/api'

export interface Notification {
  id: number
  user_id: number
  company_id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  read_at?: string
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  types: {
    budget_exceeded: boolean
    transaction_approved: boolean
    payment_due: boolean
    report_generated: boolean
    system_updates: boolean
    security_alerts: boolean
  }
}

export interface NotificationFilters {
  search?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  read?: boolean
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
  sort_by?: 'created_at' | 'title'
  sort_order?: 'asc' | 'desc'
}

class NotificationService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  // Initialize WebSocket connection
  connect(userId: number, token: string) {
    if (this.socket?.connected) {
      return
    }

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080'
    
    this.socket = io(socketUrl, {
      auth: {
        token,
        userId
      },
      transports: ['websocket', 'polling']
    })

    this.setupEventListeners()
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
  }

  // Setup WebSocket event listeners
  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Connected to notification server')
      this.reconnectAttempts = 0
      this.emit('connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification server:', reason)
      this.emit('disconnected', reason)
      
      // Attempt to reconnect
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return
      }
      this.attemptReconnect()
    })

    this.socket.on('notification', (notification: Notification) => {
      this.emit('notification', notification)
    })

    this.socket.on('notifications_read', (notificationIds: number[]) => {
      this.emit('notifications_read', notificationIds)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      this.emit('error', error)
    })
  }

  // Attempt to reconnect
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect_failed')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.socket?.connect()
    }, delay)
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // API Methods
  async getAll(filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get(`/notifications?${params.toString()}`)
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return api.get('/notifications/unread-count')
  }

  async markAsRead(notificationIds: number[]): Promise<ApiResponse<void>> {
    const response = await api.post('/notifications/mark-read', { notification_ids: notificationIds })
    
    // Emit real-time event
    if (this.socket?.connected) {
      this.socket.emit('mark_notifications_read', notificationIds)
    }
    
    return response
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    const response = await api.post('/notifications/mark-all-read')
    
    // Emit real-time event
    if (this.socket?.connected) {
      this.socket.emit('mark_all_notifications_read')
    }
    
    return response
  }

  async delete(notificationIds: number[]): Promise<ApiResponse<void>> {
    return api.post('/notifications/delete', { notification_ids: notificationIds })
  }

  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return api.get('/notifications/preferences')
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return api.put('/notifications/preferences', preferences)
  }

  // Real-time methods
  subscribeToNotifications(userId: number) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { user_id: userId })
    }
  }

  unsubscribeFromNotifications(userId: number) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { user_id: userId })
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'reconnecting' {
    if (!this.socket) return 'disconnected'
    
    switch (this.socket.connected) {
      case true:
        return 'connected'
      case false:
        return this.reconnectAttempts > 0 ? 'reconnecting' : 'disconnected'
      default:
        return 'connecting'
    }
  }
}

export const notificationService = new NotificationService()

// React hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    // Setup event listeners
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

  const markAsRead = React.useCallback(async (notificationIds: number[]) => {
    await notificationService.markAsRead(notificationIds)
  }, [])

  const markAllAsRead = React.useCallback(async () => {
    await notificationService.markAllAsRead()
  }, [])

  const refreshNotifications = React.useCallback(async (filters?: NotificationFilters) => {
    const response = await notificationService.getAll(filters)
    setNotifications(response.data.data)
  }, [])

  const refreshUnreadCount = React.useCallback(async () => {
    const response = await notificationService.getUnreadCount()
    setUnreadCount(response.data.count)
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    refreshUnreadCount
  }
}

// Import React for the hook
import React from 'react'
