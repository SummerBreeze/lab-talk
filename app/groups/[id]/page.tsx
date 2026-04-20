'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';
import Link from 'next/link';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { user } = useAuthStore();
  const { groups, fetchGroups, selectGroup, selectedGroup } = useGroupsStore();
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
    selectGroup(groupId);
  }, [groupId, groups.length, fetchGroups, selectGroup]);

  const handleCopyInviteCode = () => {
    if (selectedGroup?.inviteCode) {
      navigator.clipboard.writeText(selectedGroup.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '退出失败');
        return;
      }

      setShowLeaveModal(false);
      router.push('/groups');
    } catch (error) {
      alert('退出课题组失败');
    }
  };

  if (!selectedGroup) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#a8a8a0]">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  const creator = getUserById(selectedGroup.createdBy);
  const isCreator = user?.id === selectedGroup.createdBy;
  const teachers = selectedGroup.members
    .filter(m => m.role === 'teacher')
    .map(m => ({
      id: m.userId,
      name: (m as any).userName,
      email: (m as any).userEmail,
    }));
  const students = selectedGroup.members
    .filter(m => m.role === 'student')
    .map(m => ({
      id: m.userId,
      name: (m as any).userName,
      email: (m as any).userEmail,
    }));

  const quickActions = [
    {
      title: '组会列表',
      icon: '📅',
      description: '查看和管理组会安排',
      href: `/groups/${groupId}/meetings`,
      color: 'bg-[#9db4c0]',
    },
    {
      title: '周报列表',
      icon: '📝',
      description: '查看组内周报',
      href: `/groups/${groupId}/reports`,
      color: 'bg-[#d4b5b0]',
    },
    {
      title: 'Q&A',
      icon: '💬',
      description: '组内问答交流',
      href: `/groups/${groupId}/qa`,
      color: 'bg-[#b8c5b0]',
    },
    {
      title: '任务管理',
      icon: '✓',
      description: '查看和分配任务',
      href: `/groups/${groupId}/tasks`,
      color: 'bg-[#b8b0c8]',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 返回按钮 */}
        <Button variant="ghost" onClick={() => router.push('/groups')}>
          ← 返回课题组列表
        </Button>

        {/* 课题组基本信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{selectedGroup.name}</CardTitle>
                <p className="text-sm text-[#a8a8a0] mt-2">
                  创建者：{creator?.name} · 创建于 {new Date(selectedGroup.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="info">{selectedGroup.members.length} 名成员</Badge>
                {(isCreator || user?.role === 'teacher') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteCode(!showInviteCode)}
                  >
                    {showInviteCode ? '隐藏' : '显示'}邀请码
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#4a4a4a] mb-4">
              {selectedGroup.description || '暂无简介'}
            </p>

            {showInviteCode && selectedGroup.inviteCode && (
              <div className="mt-4 p-4 bg-[#f0ede8] rounded-lg border border-[#d8d4cc]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#4a4a4a] mb-1">邀请码</p>
                    <p className="text-2xl font-mono font-bold text-[#9db4c0] tracking-wider">
                      {selectedGroup.inviteCode}
                    </p>
                    <p className="text-xs text-[#a8a8a0] mt-1">
                      分享此邀请码给成员，让他们加入课题组
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopyInviteCode}
                  >
                    {copied ? '已复制' : '复制'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快速入口 */}
        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">快速入口</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card hover className="h-full">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center text-3xl mx-auto mb-3`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-[#4a4a4a] mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-[#a8a8a0]">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* 成员列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 教师 */}
          <Card>
            <CardHeader>
              <CardTitle>教师 ({teachers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher?.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#d8d4cc] hover:bg-[#f0ede8] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#9db4c0] flex items-center justify-center text-white font-medium">
                      {teacher?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#4a4a4a]">{teacher?.name || '未知'}</p>
                      <p className="text-sm text-[#a8a8a0]">{teacher?.email || ''}</p>
                    </div>
                    <Badge variant="info">教师</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 学生 */}
          <Card>
            <CardHeader>
              <CardTitle>学生 ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-sm text-[#a8a8a0] text-center py-8">暂无学生成员</p>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student?.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#d8d4cc] hover:bg-[#f0ede8] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#d4b5b0] flex items-center justify-center text-white font-medium">
                        {student?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#4a4a4a]">{student?.name || '未知'}</p>
                        <p className="text-sm text-[#a8a8a0]">{student?.email || ''}</p>
                      </div>
                      <Badge variant="default">学生</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 退出课题组弹窗 */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>退出课题组</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4a4a4a] mb-6">
                确定要退出课题组 <span className="font-semibold">{selectedGroup.name}</span> 吗？
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowLeaveModal(false)}
                >
                  取消
                </Button>
                <Button
                  variant="danger"
                  onClick={handleLeaveGroup}
                >
                  确认退出
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
