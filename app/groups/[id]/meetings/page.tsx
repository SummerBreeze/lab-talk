'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { useMeetingsStore } from '@/stores/meetingsStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { getGroupById } from '@/lib/mock-data';
import Link from 'next/link';

export default function GroupMeetingsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { meetings, fetchMeetings, createMeeting } = useMeetingsStore();
  const { groups, fetchGroups } = useGroupsStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    endTime: '',
    location: '',
  });

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
    fetchMeetings(groupId);
  }, [groupId, groups.length, fetchGroups, fetchMeetings]);

  const group = getGroupById(groupId);
  const groupMeetings = meetings.filter(m => m.groupId === groupId);

  const now = new Date();
  const upcomingMeetings = groupMeetings.filter(m => new Date(m.scheduledAt) > now);
  const inProgressMeetings = groupMeetings.filter(m => {
    const start = new Date(m.scheduledAt);
    const end = new Date(m.endTime);
    return start <= now && now <= end;
  });
  const pastMeetings = groupMeetings.filter(m => new Date(m.endTime) < now);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeeting({
      groupId,
      title: formData.title,
      description: formData.description,
      scheduledAt: new Date(formData.scheduledAt),
      endTime: new Date(formData.endTime),
      location: formData.location,
    });
    setShowCreateForm(false);
    setFormData({ title: '', description: '', scheduledAt: '', endTime: '', location: '' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 返回按钮 */}
        <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
          ← 返回课题组
        </Button>

        {/* 页头 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">组会列表</h1>
            <p className="text-[#a8a8a0] mt-1">{group?.name}</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '取消' : '创建组会'}
          </Button>
        </div>

        {/* 创建组会表单 */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>创建新组会</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <Input
                  label="会议标题"
                  placeholder="例如：周例会 - 项目进度汇报"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  label="会议描述"
                  placeholder="简要描述会议内容..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
                <Input
                  label="会议时间"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  required
                />
                <Input
                  label="结束时间"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
                <Input
                  label="会议地点"
                  placeholder="例如：实验室 A301"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <div className="flex gap-3">
                  <Button type="submit" variant="primary">
                    创建
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 正在进行中的组会 */}
        {inProgressMeetings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">正在进行中</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressMeetings.map((meeting) => (
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
                        {meeting.description && (
                          <p className="text-[#a8a8a0] mt-2 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 即将到来的组会 */}
        <div>
          <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">即将到来</h2>
          {upcomingMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0]">暂无即将到来的组会</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMeetings.map((meeting) => (
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
                        {meeting.description && (
                          <p className="text-[#a8a8a0] mt-2 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 历史组会 */}
        {pastMeetings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">历史组会</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastMeetings.map((meeting) => (
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
                          <span>{new Date(meeting.scheduledAt).toLocaleString('zh-CN')}</span>
                        </div>
                        {meeting.location && (
                          <div className="flex items-center gap-2 text-[#a8a8a0]">
                            <span>📍</span>
                            <span>{meeting.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
