'use client';

import React, { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useMeetingsStore } from '@/stores/meetingsStore';
import { useReportsStore } from '@/stores/reportsStore';
import { useTasksStore } from '@/stores/tasksStore';

// 延迟加载通知列表组件
const NotificationsList = dynamic(
  () => import('@/components/dashboard/NotificationsList'),
  {
    loading: () => <ListSkeleton />,
    ssr: false,
  }
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { meetings, isLoading: meetingsLoading, fetchMeetings } = useMeetingsStore();
  const { reports, isLoading: reportsLoading, fetchReports } = useReportsStore();
  const { tasks, fetchTasks } = useTasksStore();

  useEffect(() => {
    // 使用 requestIdleCallback 延迟非关键数据获取
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        fetchMeetings();
        fetchReports();
        fetchTasks();
      });
    } else {
      setTimeout(() => {
        fetchMeetings();
        fetchReports();
        fetchTasks();
      }, 100);
    }
  }, [fetchMeetings, fetchReports, fetchTasks]);

  const upcomingMeetings = useMemo(
    () => meetings.filter((m: any) => new Date(m.scheduledAt) > new Date()).slice(0, 3),
    [meetings]
  );

  const recentReports = useMemo(
    () => reports.filter((r: any) => r.isSubmitted).slice(0, 3),
    [reports]
  );

  const pendingReportsCount = useMemo(() => {
    if (user?.role === 'teacher') {
      // 教师端：统计所有未提交的周报
      return reports.filter((r: any) => !r.isSubmitted).length;
    } else {
      // 学生端：只统计自己未提交的周报
      return reports.filter((r: any) => !r.isSubmitted && r.userId === user?.id).length;
    }
  }, [reports, user?.role, user?.id]);

  const pendingTasksCount = useMemo(() => {
    return tasks.filter((t: any) => t.status === 'pending' || t.status === 'in_progress').length;
  }, [tasks]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4a4a4a]">Dashboard</h1>
          <p className="text-[#a8a8a0] mt-1">欢迎回来，{user?.name}</p>
        </div>

        {/* 快速统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/meetings">
            <Card hover className="cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748b] mb-1">Upcoming Meetings</p>
                    <p className="text-3xl font-semibold text-[#0f172a]">
                      {upcomingMeetings.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#dbeafe] rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tasks">
            <Card hover className="cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748b] mb-1">
                      {user?.role === 'teacher' ? 'Total Tasks' : 'Pending Tasks'}
                    </p>
                    <p className="text-3xl font-semibold text-[#0f172a]">
                      {pendingTasksCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#dbeafe] rounded-xl flex items-center justify-center text-2xl">
                    ✓
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/qa">
            <Card hover className="cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748b] mb-1">Q&A</p>
                    <p className="text-3xl font-semibold text-[#0f172a]">0</p>
                  </div>
                  <div className="w-12 h-12 bg-[#dbeafe] rounded-xl flex items-center justify-center text-2xl">
                    💬
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 即将到来的会议 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Meetings</CardTitle>
              <Link href="/meetings">
                <span className="text-sm text-[#6366f1] hover:underline cursor-pointer">
                  View All →
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {meetingsLoading ? (
              <ListSkeleton />
            ) : upcomingMeetings.length === 0 ? (
              <p className="text-[#a8a8a0] text-center py-8">No upcoming meetings</p>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting: any) => (
                  <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                    <div className="p-4 border border-[#e5e7eb] rounded-lg hover:border-[#6366f1] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-[#0f172a] mb-1">
                            {meeting.title}
                          </h3>
                          <p className="text-sm text-[#64748b] mb-2">
                            {meeting.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#64748b]">
                            <span>
                              📅 {new Date(meeting.scheduledAt).toLocaleDateString('zh-CN')}
                            </span>
                            <span>
                              🕐 {new Date(meeting.scheduledAt).toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {meeting.location && <span>📍 {meeting.location}</span>}
                          </div>
                        </div>
                        <Badge variant="info">Upcoming</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近的周报 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reports</CardTitle>
              <Link href="/reports">
                <span className="text-sm text-[#6366f1] hover:underline cursor-pointer">
                  View All →
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <ListSkeleton />
            ) : recentReports.length === 0 ? (
              <p className="text-[#a8a8a0] text-center py-8">No recent reports</p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report: any) => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="p-4 border border-[#e5e7eb] rounded-lg hover:border-[#6366f1] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-[#0f172a] mb-1">
                            {report.title}
                          </h3>
                          <p className="text-sm text-[#64748b] line-clamp-2 mb-2">
                            {report.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#64748b]">
                            <span>
                              📅 {new Date(report.updatedAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        <Badge variant="success">Submitted</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 通知列表 - 延迟加载 */}
        <NotificationsList />
      </div>
    </DashboardLayout>
  );
}
