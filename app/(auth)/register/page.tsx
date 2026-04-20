'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student' as 'teacher' | 'student',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );
      if (success) {
        router.push('/dashboard');
      } else {
        setError('注册失败，请重试');
      }
    } catch (err) {
      setError('注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl mb-4">
            <span className="text-white text-3xl font-semibold">L</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0f172a] mb-2">
            Create your account
          </h1>
          <p className="text-sm text-[#64748b]">
            Join LabTalk to start collaborating
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              label="Name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.role === 'student'
                      ? 'border-[#6366f1] bg-[#eef2ff] text-[#6366f1]'
                      : 'border-[#e5e7eb] bg-white text-[#64748b] hover:border-[#d1d5db]'
                  }`}
                >
                  👨‍🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'teacher' })}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.role === 'teacher'
                      ? 'border-[#6366f1] bg-[#eef2ff] text-[#6366f1]'
                      : 'border-[#e5e7eb] bg-white text-[#64748b] hover:border-[#d1d5db]'
                  }`}
                >
                  👨‍🏫 Teacher
                </button>
              </div>
            </div>

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
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748b]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#6366f1] hover:text-[#4f46e5] font-medium">
                Sign in
              </Link>
            </p>
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
