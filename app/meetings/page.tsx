'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MeetingCardSkeleton } from '@/components/ui/Skeleton';
import { useMeetingsStore } from '@/stores/meetingsStore';
import { useGroupsStore } from '@/stores/groupsStore';
import Link from 'next/link';

// 延迟加载创建表单组件
const MeetingCreateForm = dynamic(
  () => import('@/components/meetings/MeetingCreateForm'),
  {
    loading: () => <div className="p-4">Loading form...</div>,
    ssr: false,
  }
);

export default function MeetingsPage() {
  const { meetings, isLoading, fetchMeetings, createMeeting } = useMeetingsStore();
  const { groups, fetchGroups } = useGroupsStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    groupId: '',
    title: '',
    description: '',
    scheduledAt: '',
    endTime: '',
    location: '',
  });
  const [groupsMap, setGroupsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
    fetchMeetings();
  }, [groups.length, fetchGroups, fetchMeetings]);

  // 获取所有课题组信息并建立映射 - 使用批量API优化
  useEffect(() => {
    const fetchGroupsInfo = async () => {
      const uniqueGroupIds = [...new Set(meetings.map(m => m.groupId))];

      if (uniqueGroupIds.length === 0) return;

      try {
        const res = await fetch(`/api/groups/batch?ids=${uniqueGroupIds.join(',')}`);
        const data = await res.json();

        if (data.groups) {
          const map: Record<string, any> = {};
          data.groups.forEach((group: any) => {
            map[group.id] = group;
          });
          setGroupsMap(map);
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };

    if (meetings.length > 0) {
      fetchGroupsInfo();
    }
  }, [meetings]);

  const now = useMemo(() => new Date(), []);

  const upcomingMeetings = useMemo(
    () => meetings.filter(m => new Date(m.scheduledAt) > now),
    [meetings, now]
  );

  const inProgressMeetings = useMemo(() => {
    return meetings.filter(m => {
      const start = new Date(m.scheduledAt);
      const end = new Date(m.endTime);
      return start <= now && now <= end;
    });
  }, [meetings, now]);

  const pastMeetings = useMemo(
    () => meetings.filter(m => new Date(m.endTime) < now),
    [meetings, now]
  );

  const handleCreateMeeting = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeeting({
      groupId: formData.groupId,
      title: formData.title,
      description: formData.description,
      scheduledAt: new Date(formData.scheduledAt),
      endTime: new Date(formData.endTime),
      location: formData.location,
    });
    setShowCreateForm(false);
    setFormData({ groupId: '', title: '', description: '', scheduledAt: '', endTime: '', location: '' });
  }, [formData, createMeeting]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">组会</h1>
            <p className="text-[#a8a8a0] mt-1">查看和管理组会安排</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '取消' : '创建组会'}
          </Button>
        </div>

        {/* 创建组会表单 */}
        {showCreateForm && (
          <MeetingCreateForm
            groups={groups}
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleCreateMeeting}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">正在进行中</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
            </div>
          ) : inProgressMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0]">暂无正在进行中的组会</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressMeetings.map((meeting) => {
                const group = groupsMap[meeting.groupId];
                return (
                  <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                    <Card hover>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle>{meeting.title}</CardTitle>
                          <Badge variant="success">正在进行中</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-[#4a4a4a]">
                            <span>📅</span>
                            <span>{new Date(meeting.scheduledAt).toLocaleString('zh-CN')} - {new Date(meeting.endTime).toLocaleString('zh-CN')}</span>
                          </div>
                          {meeting.location && (
                            <div className="flex items-center gap-2 text-[#4a4a4a]">
                              <span>📍</span>
                              <span>{meeting.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[#a8a8a0]">
                            <span>👥</span>
                            <span>{group?.name || '加载中...'}</span>
                          </div>
                          {meeting.description && (
                            <p className="text-[#a8a8a0] mt-2 line-clamp-2">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">即将到来</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0]">暂无即将到来的组会</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMeetings.map((meeting) => {
                const group = groupsMap[meeting.groupId];
                return (
                  <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                    <Card hover>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle>{meeting.title}</CardTitle>
                          <Badge variant="info">即将开始</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-[#4a4a4a]">
                            <span>📅</span>
                            <span>{new Date(meeting.scheduledAt).toLocaleString('zh-CN')}</span>
                          </div>
                          {meeting.location && (
                            <div className="flex items-center gap-2 text-[#4a4a4a]">
                              <span>📍</span>
                              <span>{meeting.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[#a8a8a0]">
                            <span>👥</span>
                            <span>{group?.name || '加载中...'}</span>
                          </div>
                          {meeting.description && (
                            <p className="text-[#a8a8a0] mt-2 line-clamp-2">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {pastMeetings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">历史组会</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MeetingCardSkeleton />
                <MeetingCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastMeetings.map((meeting) => {
                  const group = groupsMap[meeting.groupId];
                  return (
                    <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                      <Card hover>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-[#a8a8a0]">{meeting.title}</CardTitle>
                            <Badge variant="default">已结束</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-[#a8a8a0]">
                              <span>📅</span>
                              <span>{new Date(meeting.scheduledAt).toLocaleString('zh-CN')} - {new Date(meeting.endTime).toLocaleString('zh-CN')}</span>
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-2 text-[#a8a8a0]">
                                <span>📍</span>
                                <span>{meeting.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[#a8a8a0]">
                              <span>👥</span>
                              <span>{group?.name || '加载中...'}</span>
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
        )}
      </div>
    </DashboardLayout>
  );
}
