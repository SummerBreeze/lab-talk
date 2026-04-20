'use client';

import React, { useEffect, useState } from 'react';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function NotificationBell() {
  const router = useRouter();
  const { unreadCount, notifications, fetchNotifications, markAsRead, connectSSE, disconnectSSE } = useNotificationsStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    connectSSE();

    // 请求浏览器通知权限
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      disconnectSSE();
    };
  }, [fetchNotifications, connectSSE, disconnectSSE]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '📅';
      case 'comment': return '💬';
      case 'task': return '✅';
      case 'report': return '📝';
      case 'mention': return '@';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#f5f3f0] rounded-lg transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-y-auto bg-white rounded-lg shadow-lg border border-[#d8d4cc] z-50">
            <div className="p-4 border-b border-[#d8d4cc] flex items-center justify-between">
              <h3 className="font-semibold text-[#4a4a4a]">通知</h3>
              {unreadCount > 0 && (
                <Badge variant="info">{unreadCount} 条未读</Badge>
              )}
            </div>

            <div className="divide-y divide-[#d8d4cc]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#a8a8a0]">
                  暂无通知
                </div>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-[#f5f3f0] transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-[#4a4a4a] text-sm">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-[#a8a8a0] line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-[#a8a8a0] mt-1">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
