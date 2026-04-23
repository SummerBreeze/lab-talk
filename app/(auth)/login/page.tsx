'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('邮箱或密码错误');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl mb-4">
            <span className="text-white text-3xl font-semibold">L</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0f172a] mb-2">
            Welcome to LabTalk
          </h1>
          <p className="text-sm text-[#64748b]">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-sm text-[#dc2626]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748b]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#6366f1] hover:text-[#4f46e5] font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Test Accounts */}
          <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
            <p className="text-xs font-medium text-[#64748b] mb-3">Test Accounts</p>
            <div className="text-xs text-[#64748b] space-y-2 bg-[#f8fafc] p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span>👨‍🏫</span>
                <span>Teacher: 6666666@qq.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👨‍🎓</span>
                <span>Student: 8888888@qq.com</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#e5e7eb]">
                <span>🔑</span>
                <span>Password: 123456</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#94a3b8] mt-6">
          LabTalk v1.0.0 - Research Lab Management System
        </p>
      </div>
    </div>
  );
}
