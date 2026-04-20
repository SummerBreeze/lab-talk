'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useReportsStore } from '@/stores/reportsStore';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';

const ReportCreateForm = dynamic(
  () => import('@/components/reports/ReportCreateForm'),
  {
    loading: () => <div className="p-4">Loading form...</div>,
    ssr: false,
  }
);

export default function NewReportPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { createReport } = useReportsStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    groupId: '',
    visibility: 'private' as 'private' | 'group' | 'teacher',
  });

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    } else if (!formData.groupId) {
      setFormData(prev => ({ ...prev, groupId: groups[0]?.id || '1' }));
    }
  }, [groups, fetchGroups, formData.groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReport({
      ...formData,
      userId: user?.id,
    });
    router.push('/reports');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">创建周报</h1>
            <p className="text-[#a8a8a0] mt-1">记录本周的工作进展</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            取消
          </Button>
        </div>

        <ReportCreateForm
          groups={groups}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
}
