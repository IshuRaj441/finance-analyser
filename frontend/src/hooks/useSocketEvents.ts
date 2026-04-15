import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

export const useSocketEvents = () => {
  const { addNotification, updateNotification } = useNotificationStore();

  useEffect(() => {
    // Listen for new notifications from socket
    const handleNewNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };

    // Listen for notification updates from socket
    const handleNotificationUpdated = (event: CustomEvent) => {
      const { id, ...updates } = event.detail;
      updateNotification(id, updates);
    };

    // Add event listeners
    window.addEventListener('notification:new', handleNewNotification as EventListener);
    window.addEventListener('notification:updated', handleNotificationUpdated as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('notification:new', handleNewNotification as EventListener);
      window.removeEventListener('notification:updated', handleNotificationUpdated as EventListener);
    };
  }, [addNotification, updateNotification]);
};
