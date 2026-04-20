'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeeklyReportCard } from '@/components/reports/WeeklyReportCard';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import { useReportsStore } from '@/stores/reportsStore';
import { useAuthStore } from '@/stores/authStore';

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { reports, isLoading, fetchReports, startAutoRefresh, stopAutoRefresh } = useReportsStore();
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchReports();

    // 如果是教师，启动自动刷新（每10秒）
    if (user?.role === 'teacher') {
      startAutoRefresh(undefined, 10000);
    }

    // 清理函数
    return () => {
      stopAutoRefresh();
    };
  }, [fetchReports, startAutoRefresh, stopAutoRefresh, user?.role]);

  const fetchUsersInfo = useCallback(async () => {
    const uniqueUserIds = [...new Set(reports.map(r => r.userId))];

    if (uniqueUserIds.length === 0) return;

    try {
      const res = await fetch(`/api/users/batch?ids=${uniqueUserIds.join(',')}`);
      const data = await res.json();

      if (data.users) {
        const map: Record<string, any> = {};
        data.users.forEach((user: any) => {
          map[user.id] = user;
        });
        setUsersMap(map);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  }, [reports]);

  useEffect(() => {
    if (reports.length > 0) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          fetchUsersInfo();
        });
      } else {
        setTimeout(() => {
          fetchUsersInfo();
        }, 100);
      }
    }
  }, [reports, fetchUsersInfo]);

  const myReports = useMemo(
    () => reports.filter(r => r.userId === user?.id),
    [reports, user?.id]
  );

  const allSubmittedReports = useMemo(
    () => reports.filter(r => r.isSubmitted),
    [reports]
  );

  const submittedReports = useMemo(
    () => user?.role === 'teacher' ? allSubmittedReports : myReports.filter(r => r.isSubmitted),
    [user?.role, allSubmittedReports, myReports]
  );

  const draftReports = useMemo(
    () => myReports.filter(r => !r.isSubmitted),
    [myReports]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">周报</h1>
            <p className="text-[#a8a8a0] mt-1">
              {user?.role === 'teacher' ? '查看学生周报' : '管理你的周报'}
            </p>
          </div>
          {user?.role === 'student' && (
            <Button variant="primary" onClick={() => router.push('/reports/new')}>
              创建周报
            </Button>
          )}
        </div>

        {draftReports.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">草稿</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportCardSkeleton />
                <ReportCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftReports.map((report) => {
                  const author = usersMap[report.userId];
                  return (
                    <WeeklyReportCard
                      key={report.id}
                      title={report.title}
                      content={report.content}
                      authorName={author?.name || '加载中...'}
                      updatedAt={report.updatedAt}
                      visibility={report.visibility}
                      isSubmitted={report.isSubmitted}
                      onClick={() => router.push(`/reports/${report.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">
            {user?.role === 'teacher' ? '学生已提交周报' : '已提交'}
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </div>
          ) : submittedReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0] mb-4">
                  {user?.role === 'teacher' ? '暂无学生提交周报' : '你还没有提交任何周报'}
                </p>
                {user?.role === 'student' && (
                  <Button variant="primary" onClick={() => router.push('/reports/new')}>
                    创建第一份周报
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submittedReports.map((report) => {
                const author = usersMap[report.userId];
                return (
                  <WeeklyReportCard
                    key={report.id}
                    title={report.title}
                    content={report.content}
                    authorName={author?.name || '加载中...'}
                    submittedAt={report.submittedAt}
                    updatedAt={report.updatedAt}
                    visibility={report.visibility}
                    isSubmitted={report.isSubmitted}
                    onClick={() => router.push(`/reports/${report.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
