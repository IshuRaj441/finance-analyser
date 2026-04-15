import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentToken: string | null = null;

  connect(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!token) {
        console.error('No authentication token available');
        resolve(false);
        return;
      }

      // Store token for reconnection
      this.currentToken = token;

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      
      console.log(`Connecting to socket server at: ${socketUrl}`);
      
      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server');
        this.reconnectAttempts = 0;
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.handleReconnect();
        resolve(false);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect manually
          if (this.currentToken) {
            this.connect(this.currentToken);
          }
        }
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Notification events
    this.socket.on('notification:new', (notification) => {
      console.log('New notification received:', notification);
      this.handleNewNotification(notification);
    });

    this.socket.on('notification:count', (data) => {
      console.log('Notification count updated:', data);
      this.updateNotificationCount(data.unread);
    });

    this.socket.on('notification-updated', (data) => {
      console.log('Notification updated:', data);
      this.handleNotificationUpdated(data);
    });

    // Transaction events
    this.socket.on('transaction:updated', (data) => {
      console.log('Transaction updated:', data);
      this.handleTransactionUpdated(data);
    });

    // Budget events
    this.socket.on('budget:updated', (data) => {
      console.log('Budget updated:', data);
      this.handleBudgetUpdated(data);
    });

    // User presence events
    this.socket.on('user-disconnected', (data) => {
      console.log('User disconnected:', data);
      this.handleUserDisconnected(data);
    });

    // Typing indicators for chat
    this.socket.on('user-typing', (data) => {
      console.log('User typing:', data);
      this.handleUserTyping(data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.currentToken) {
          this.connect(this.currentToken);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleNewNotification(notification: any): void {
    // Show toast notification
    this.showToast(notification);
    
    // Play notification sound if enabled
    this.playNotificationSound();
    
    // Emit custom event for React components to handle
    window.dispatchEvent(new CustomEvent('notification:new', { detail: notification }));
  }

  private handleNotificationUpdated(data: any): void {
    // Emit custom event for React components to handle
    window.dispatchEvent(new CustomEvent('notification:updated', { detail: data }));
  }

  private handleTransactionUpdated(data: any): void {
    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('transaction:updated', { detail: data }));
  }

  private handleBudgetUpdated(data: any): void {
    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('budget:updated', { detail: data }));
  }

  private handleUserDisconnected(data: any): void {
    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('user:disconnected', { detail: data }));
  }

  private handleUserTyping(data: any): void {
    // Emit custom event for chat components
    window.dispatchEvent(new CustomEvent('user:typing', { detail: data }));
  }

  private showToast(notification: any): void {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
      notification.priority === 'high' ? 'bg-red-500' : 
      notification.priority === 'warning' ? 'bg-yellow-500' : 
      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    } text-white max-w-sm`;
    
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${this.getNotificationIcon(notification.type)}
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">${notification.title}</p>
          <p class="text-sm opacity-90 mt-1">${notification.message}</p>
        </div>
        <button class="ml-3 flex-shrink-0 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  private getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'budget_exceeded': '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
      'transaction_approved': '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
      'new_transaction': '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"></path></svg>',
      'report_generated': '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clip-rule="evenodd"></path></svg>',
      'suspicious_activity': '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
    };
    
    return icons[type] || '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>';
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  private updateNotificationCount(count: number): void {
    // Update the notification badge in the sidebar
    const badgeElement = document.querySelector('[data-notification-badge]');
    if (badgeElement) {
      if (count > 0) {
        badgeElement.textContent = count > 99 ? '99+' : count.toString();
        badgeElement.classList.remove('hidden');
      } else {
        badgeElement.classList.add('hidden');
      }
    }

    // Update page title
    if (count > 0) {
      document.title = `(${count}) Finance Analyser`;
    } else {
      document.title = 'Finance Analyser';
    }
  }

  // Public methods for manual socket interactions
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
    }
  }

  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
    }
  }

  markNotificationAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('notification-read', notificationId);
    }
  }

  startTyping(recipientId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', { recipientId });
    }
  }

  stopTyping(recipientId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', { recipientId });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
    this.currentToken = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
