import { create } from 'zustand';

export interface Notification {
  id: string;
  userId: string;
  type: 'meeting' | 'comment' | 'task' | 'material' | 'report' | 'mention' | 'system';
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  eventSource: EventSource | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  eventSource: null,

  fetchNotifications: async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();

      if (data.notifications) {
        const notifications = data.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));

        const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

        set({ notifications, unreadCount });
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  connectSSE: () => {
    const { eventSource } = get();
    if (eventSource) return;

    const es = new EventSource('/api/notifications/stream');

    es.onopen = () => {
      console.log('SSE connected');
      set({ isConnected: true });
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          const newNotification: Notification = {
            ...data.data,
            createdAt: new Date(data.data.createdAt),
          };

          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));

          // 浏览器通知
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.content,
              icon: '/favicon.ico',
            });
          }
        }
      } catch (error) {
        console.error('SSE message parse error:', error);
      }
    };

    es.onerror = () => {
      console.error('SSE error, reconnecting...');
      set({ isConnected: false });
      es.close();
      set({ eventSource: null });

      // 5秒后重连
      setTimeout(() => {
        get().connectSSE();
      }, 5000);
    };

    set({ eventSource: es });
  },

  disconnectSSE: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, isConnected: false });
    }
  },
}));
