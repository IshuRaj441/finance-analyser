import { api } from '../lib/api';

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

export interface NotificationCount {
  total: number;
  unread: number;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  database_notifications: boolean;
}

export interface GetNotificationsParams {
  limit?: number;
  unread_only?: boolean;
  page?: number;
}

export interface GetNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface GetUnreadNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    count: number;
  };
}

export interface GetNotificationCountResponse {
  success: boolean;
  message: string;
  data: NotificationCount;
}

export interface UpdateNotificationSettingsResponse {
  success: boolean;
  message: string;
  data: NotificationSettings;
}

class NotificationService {
  private basePath = '/notifications';

  async getNotifications(params?: GetNotificationsParams): Promise<GetNotificationsResponse> {
    return await api.get(this.basePath, { params });
  }

  async getUnreadNotifications(params?: { limit?: number }): Promise<GetUnreadNotificationsResponse> {
    return await api.get(`${this.basePath}/unread`, { params });
  }

  async getNotificationCount(): Promise<GetNotificationCountResponse> {
    return await api.get(`${this.basePath}/count`);
  }

  async markAsRead(id: string): Promise<void> {
    await api.put(`${this.basePath}/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put(`${this.basePath}/read-all`);
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async getSettings(): Promise<UpdateNotificationSettingsResponse> {
    return await api.get(`${this.basePath}/settings`);
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<UpdateNotificationSettingsResponse> {
    return await api.put(`${this.basePath}/settings`, settings);
  }

  // Helper methods for real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    const handleNotification = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('notification:new', handleNotification as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('notification:new', handleNotification as EventListener);
    };
  }

  subscribeToNotificationCount(callback: (count: number) => void): () => void {
    const handleCountUpdate = (event: CustomEvent) => {
      callback(event.detail.unread);
    };

    window.addEventListener('notification:count', handleCountUpdate as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('notification:count', handleCountUpdate as EventListener);
    };
  }

  // Helper method to format notification time
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Helper method to get notification priority color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Helper method to get notification icon
  getNotificationIcon(type: string, className = 'h-5 w-5'): string {
    const icons: Record<string, string> = {
      budget_exceeded: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
      transaction_approved: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`,
      transaction_rejected: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`,
      new_transaction: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"></path></svg>`,
      report_generated: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clip-rule="evenodd"></path></svg>`,
      suspicious_activity: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
      welcome: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>`,
      password_changed: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>`,
      login_new_device: `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd"></path></svg>`,
    };

    return icons[type] || `<svg class="${className}" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>`;
  }
}

export const notificationService = new NotificationService();
