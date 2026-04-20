'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useReportsStore } from '@/stores/reportsStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';
import { ListSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function GroupReportsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { user } = useAuthStore();
  const { reports, isLoading, fetchReports, startAutoRefresh, stopAutoRefresh } = useReportsStore();
  const { groups, fetchGroups } = useGroupsStore();

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
    fetchReports(groupId);

    // 如果是教师，启动自动刷新（每10秒）
    if (user?.role === 'teacher') {
      startAutoRefresh(groupId, 10000);
    }

    // 清理函数
    return () => {
      stopAutoRefresh();
    };
  }, [groupId, groups.length, fetchGroups, fetchReports, startAutoRefresh, stopAutoRefresh, user?.role]);

  const group = groups.find(g => g.id === groupId);
  const groupReports = reports.filter(r => r.groupId === groupId && r.isSubmitted);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
          ← 返回课题组
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">周报列表</h1>
            <p className="text-[#a8a8a0] mt-1">{group?.name}</p>
          </div>
        </div>

        {isLoading ? (
          <ListSkeleton count={5} />
        ) : groupReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[#a8a8a0]">暂无周报</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupReports.map((report) => {
              const author = getUserById(report.userId);
              return (
                <Link key={report.id} href={`/reports/${report.id}`}>
                  <Card hover>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#4a4a4a]">
                              {report.title}
                            </h3>
                            <Badge variant={report.visibility === 'group' ? 'info' : 'warning'}>
                              {report.visibility === 'group' ? '组内可见' : '仅教师'}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#a8a8a0] line-clamp-2 mb-3">
                            {report.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#a8a8a0]">
                            <span>作者：{author?.name}</span>
                            <span>提交于 {new Date(report.submittedAt!).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
