'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'HOME', href: '/dashboard', icon: '▣' },
    { name: 'GROUPS', href: '/groups', icon: '◈' },
    { name: 'MEETS', href: '/meetings', icon: '◐' },
    { name: 'REPORTS', href: '/reports', icon: '◪' },
    { name: 'Q&A', href: '/qa', icon: '◉' },
    { name: 'TASKS', href: '/tasks', icon: '◎' },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside className="w-64 bg-white border-r border-[#e5e7eb] min-h-screen relative flex flex-col">
      {/* Logo / Header */}
      <div className="p-6 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6366f1] rounded-lg flex items-center justify-center text-white font-semibold text-lg">
            L
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#0f172a]">
              LabTalk
            </h1>
            <p className="text-xs text-[#64748b]">
              v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-[#eef2ff] text-[#6366f1]'
                : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div className="p-4 border-t border-[#e5e7eb] space-y-3">
          {/* User Card */}
          <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
            <div className="w-10 h-10 bg-[#6366f1] rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0f172a] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#64748b]">
                {user.role === 'teacher' ? 'Teacher' : 'Student'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#ef4444] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#fef2f2] hover:border-[#fecaca] transition-all duration-200"
          >
            <span>←</span>
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
