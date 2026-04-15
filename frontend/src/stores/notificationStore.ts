import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { notificationService } from '../services/notificationService';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  icon?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadNotifications: () => Promise<void>;
  fetchNotificationCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,

      fetchNotifications: async (unreadOnly = false) => {
        set({ loading: true, error: null });
        
        try {
          const response = await notificationService.getNotifications({ 
            unread_only: unreadOnly 
          });
          
          set({
            notifications: response.data.notifications,
            loading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch notifications',
            loading: false
          });
        }
      },

      fetchUnreadNotifications: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await notificationService.getUnreadNotifications();
          
          set({
            notifications: response.data.notifications,
            unreadCount: response.data.count,
            loading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch unread notifications',
            loading: false
          });
        }
      },

      fetchNotificationCount: async () => {
        try {
          const response = await notificationService.getNotificationCount();
          
          set({
            unreadCount: response.data.unread
          });
        } catch (error) {
          console.error('Failed to fetch notification count:', error);
        }
      },

      markAsRead: async (id: string) => {
        try {
          await notificationService.markAsRead(id);
          
          set(state => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark notification as read'
          });
        }
      },

      markAllAsRead: async () => {
        try {
          await notificationService.markAllAsRead();
          
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, is_read: true })),
            unreadCount: 0
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
          });
        }
      },

      deleteNotification: async (id: string) => {
        try {
          await notificationService.deleteNotification(id);
          
          set(state => {
            const notification = state.notifications.find(n => n.id === id);
            const wasUnread = notification?.is_read === false;
            
            return {
              notifications: state.notifications.filter(n => n.id !== id),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete notification'
          });
        }
      },

      addNotification: (notification: Notification) => {
        set(state => {
          const exists = state.notifications.some(n => n.id === notification.id);
          if (exists) return state;

          return {
            notifications: [notification, ...state.notifications],
            unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1
          };
        });
      },

      updateNotification: (id: string, updates: Partial<Notification>) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, ...updates } : n
          )
        }));
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'notification-store'
    }
  )
);
