'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checkSession, isLoading } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] pixel-grid">
        <div className="text-center">
          <div className="mb-6 p-4 bg-[#16213e] border-[3px] border-[#00ff41] inline-block">
            <div className="w-16 h-16 bg-[#00ff41] border-[2px] border-[#00cc33] flex items-center justify-center text-[#1a1a2e] font-bold text-[32px]">
              L
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-[#00ff41] text-[12px] font-bold">
            <span className="blink">►</span>
            <span className="uppercase tracking-wider">LOADING</span>
            <span className="blink">◄</span>
          </div>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-[#00ff41] blink"></div>
            <div className="w-2 h-2 bg-[#00ff41] blink" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#00ff41] blink" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
