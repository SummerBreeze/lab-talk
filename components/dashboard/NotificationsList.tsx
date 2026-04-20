import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications.filter((n: any) => !n.isRead).slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Link href="/notifications">
            <span className="text-sm text-[#6366f1] hover:underline cursor-pointer">
              View All →
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-[#a8a8a0] text-center py-8">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-[#a8a8a0] text-center py-8">No new notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border border-[#e5e7eb] rounded-lg hover:border-[#6366f1] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-[#0f172a] mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-[#64748b] mb-2">
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#64748b]">
                      <span>
                        📅 {new Date(notification.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Badge variant="info">New</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
