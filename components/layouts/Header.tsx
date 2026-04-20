'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/authStore';

const NotificationBell = dynamic(
  () => import('@/components/notifications/NotificationBell').then(mod => ({ default: mod.NotificationBell })),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8" />,
  }
);

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-[#e5e7eb] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <span>●</span>
            <span>
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).replace(/\//g, '.')}
            </span>
          </div>
          <div className="h-4 w-px bg-[#e5e7eb]"></div>
          <div className="text-sm text-[#64748b]">
            {new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#d1fae5] text-[#065f46] rounded-full text-xs font-medium">
            <span>●</span>
            <span>Online</span>
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Level Display */}
          {user && (
            <div className="px-3 py-1.5 bg-[#eef2ff] text-[#6366f1] rounded-full text-xs font-medium">
              Level {user.role === 'teacher' ? '99' : '42'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
