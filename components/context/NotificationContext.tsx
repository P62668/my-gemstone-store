import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../utils/apiClient';
import { toast } from 'react-hot-toast';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  orderId?: number;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  setError: (msg: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: '',
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  addNotification: async () => {},
  removeNotification: async () => {},
  setError: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/notifications');
      if (res.ok) {
        const notificationData = res.data as Notification[];
        setNotifications(notificationData);
        const unread = notificationData.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      setError('Error fetching notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const res = await apiClient.patch(`/api/notifications/${id}`, { read: true });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setError('Failed to mark notification as read');
      }
    } catch (err) {
      setError('Error marking notification as read');
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await apiClient.post('/api/notifications/read-all');
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      } else {
        setError('Failed to mark all notifications as read');
      }
    } catch (err) {
      setError('Error marking all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await apiClient.post('/api/notifications', notification);
      if (res.ok) {
        const newNotification = res.data as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
        }
      } else {
        setError('Failed to add notification');
      }
    } catch (err) {
      setError('Error adding notification');
      console.error('Error adding notification:', err);
    }
  }, []);

  const removeNotification = useCallback(async (id: number) => {
    try {
      const res = await apiClient.delete(`/api/notifications/${id}`);
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Update unread count if the deleted notification was unread
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        setError('Failed to remove notification');
      }
    } catch (err) {
      setError('Error removing notification');
      console.error('Error removing notification:', err);
    }
  }, [notifications]);

  // Initialize WebSocket connection
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    // Get user ID from localStorage or cookies
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) return;

    // Create WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/api/ws?userId=${userId}`;
    
    try {
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log('[WebSocket] Connected to notification service');
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // Add new notification to the top of the list
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification
            toast.custom((t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {data.notification.type === 'success' && (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600">✓</span>
                        </div>
                      )}
                      {data.notification.type === 'warning' && (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600">!</span>
                        </div>
                      )}
                      {data.notification.type === 'error' && (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600">✗</span>
                        </div>
                      )}
                      {data.notification.type === 'info' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600">i</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {data.notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {data.notification.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            ), {
              duration: 5000
            });
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
      };
      
      socketRef.current.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.reason);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (userId) {
            // Reconnect logic would go here
          }
        }, 5000);
      };
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
    }
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
        setError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);