'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';
import Link from 'next/link';

export default function GroupsPage() {
  const { user } = useAuthStore();
  const { groups, fetchGroups, createGroup } = useGroupsStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createGroup(name, description);
      setName('');
      setDescription('');
      setShowCreateModal(false);
      fetchGroups();
    } catch (err) {
      setError('创建课题组失败');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '加入失败');
        return;
      }

      setInviteCode('');
      setShowJoinModal(false);
      fetchGroups();
    } catch (err) {
      setError('加入课题组失败');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-slide-in-right">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-float">👥</span>
            <div>
              <h1 className="text-3xl font-bold text-[#4a4a4a]">课题组</h1>
              <p className="text-[#a8a8a0] mt-1">管理和查看你的课题组</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowJoinModal(true)}
              className="hover:scale-105 transition-transform"
            >
              ➕ 加入课题组
            </Button>
            {user?.role === 'teacher' && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="hover:scale-105 transition-transform shadow-md"
              >
                ✨ 创建课题组
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => {
            const creator = getUserById(group.createdBy);
            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card
                  hover
                  className="h-full animate-bounce-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl animate-wiggle">🔬</span>
                        <CardTitle>{group.name}</CardTitle>
                      </div>
                      <Badge variant="info" className="shadow-sm">
                        👤 {group.members.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a8a8a0] mb-4 line-clamp-2">
                      {group.description || '✨ 暂无描述'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#a8a8a0]">
                      <span>👨‍🏫 创建者：{creator?.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {groups.length === 0 && (
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="text-6xl mb-4 animate-float">🎯</div>
              <p className="text-[#a8a8a0] mb-6 text-lg">你还没有加入任何课题组</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowJoinModal(true)}
                  className="hover:scale-105 transition-transform"
                >
                  ➕ 加入课题组
                </Button>
                {user?.role === 'teacher' && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="hover:scale-105 transition-transform"
                  >
                    ✨ 创建第一个课题组
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 创建课题组弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md mx-4 animate-bounce-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <CardTitle>创建课题组</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-600 animate-wiggle">
                    ⚠️ {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                    📝 课题组名称 *
                  </label>
                  <Input
                    placeholder="例如：AI研究组"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                    📄 描述
                  </label>
                  <Textarea
                    placeholder="简单介绍一下课题组的研究方向..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="primary">
                    🚀 创建
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 加入课题组弹窗 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md mx-4 animate-bounce-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <CardTitle>加入课题组</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-600 animate-wiggle">
                    ⚠️ {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                    🔑 邀请码 *
                  </label>
                  <Input
                    placeholder="输入6位邀请码"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                    className="uppercase text-center text-2xl font-mono tracking-widest"
                  />
                  <p className="text-xs text-[#a8a8a0] mt-2 text-center">
                    💡 向课题组管理员获取邀请码
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowJoinModal(false);
                      setError('');
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="primary">
                    🚀 加入
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
