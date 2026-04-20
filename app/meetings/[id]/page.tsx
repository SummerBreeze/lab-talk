'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { useMeetingsStore } from '@/stores/meetingsStore';
import { useMeetingNotesStore } from '@/stores/meetingNotesStore';

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const { meetings, fetchMeetings } = useMeetingsStore();
  const { notes, isLoading, fetchNotes, addNote } = useMeetingNotesStore();
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);

  useEffect(() => {
    if (meetings.length === 0) {
      fetchMeetings();
    }
  }, [meetings.length, fetchMeetings]);

  useEffect(() => {
    fetchNotes(meetingId);
    // 每5秒刷新一次笔记
    const interval = setInterval(() => {
      fetchNotes(meetingId);
    }, 5000);
    return () => clearInterval(interval);
  }, [meetingId, fetchNotes]);

  // 获取课题组和创建者信息
  useEffect(() => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
      // 获取课题组信息
      fetch(`/api/groups/${meeting.groupId}`)
        .then(res => res.json())
        .then(data => setGroupInfo(data.group))
        .catch(err => console.error('Failed to fetch group:', err));

      // 获取创建者信息
      fetch(`/api/users/${meeting.createdBy}`)
        .then(res => res.json())
        .then(data => setCreatorInfo(data.user))
        .catch(err => console.error('Failed to fetch creator:', err));
    }
  }, [meetings, meetingId]);

  const meeting = meetings.find(m => m.id === meetingId);

  if (!meeting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#a8a8a0]">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();
  const startTime = new Date(meeting.scheduledAt);
  const endTime = new Date(meeting.endTime);
  const isInProgress = startTime <= now && now <= endTime;
  const isCompleted = endTime < now;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addNote(meetingId, noteContent);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成总结失败');
      }

      const data = await response.json();
      // 刷新会议数据以获取新的总结
      await fetchMeetings();
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert(error instanceof Error ? error.message : '生成总结失败');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{meeting.title}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-[#a8a8a0]">
                  <span>创建者：{creatorInfo?.name || '加载中...'}</span>
                  <span>·</span>
                  <span>课题组：{groupInfo?.name || '加载中...'}</span>
                </div>
              </div>
              <Badge variant={isInProgress ? 'success' : isCompleted ? 'default' : 'info'}>
                {isInProgress ? '正在进行中' : isCompleted ? '已结束' : '即将开始'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-[#f5f3f0]">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-xs text-[#a8a8a0] mb-1">会议时间</p>
                    <p className="text-sm font-medium text-[#4a4a4a]">
                      {new Date(meeting.scheduledAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {meeting.location && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#f5f3f0]">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-xs text-[#a8a8a0] mb-1">会议地点</p>
                      <p className="text-sm font-medium text-[#4a4a4a]">
                        {meeting.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {meeting.description && (
                <div>
                  <h3 className="text-sm font-semibold text-[#4a4a4a] mb-2">会议描述</h3>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">
                    {meeting.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI会议总结</CardTitle>
              {!meeting.summary && (
                <Button
                  variant="primary"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary || notes.length === 0}
                >
                  {isGeneratingSummary ? '生成中...' : '生成总结'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {meeting.summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="p-4 rounded-lg bg-[#f5f3f0] border border-[#e5e5e0]">
                  <p className="text-sm text-[#4a4a4a] whitespace-pre-wrap leading-relaxed">
                    {meeting.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#a8a8a0] mb-2">暂无会议总结</p>
                {notes.length === 0 && (
                  <p className="text-xs text-[#a8a8a0]">请先添加会议笔记</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isInProgress ? '会议笔记' : '会议笔记记录'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isInProgress && (
              <form onSubmit={handleAddNote} className="mb-6">
                <Textarea
                  placeholder="在这里记录会议笔记..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="mb-3"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !noteContent.trim()}
                >
                  {isSubmitting ? '提交中...' : '添加笔记'}
                </Button>
              </form>
            )}

            <div className="space-y-4">
              {isLoading && notes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#a8a8a0]">加载中...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#a8a8a0]">
                    {isInProgress ? '还没有笔记，开始记录吧！' : '本次会议没有笔记记录'}
                  </p>
                </div>
              ) : (
                notes.map((note) => {
                  return (
                    <div
                      key={note.id}
                      className="p-4 rounded-lg bg-[#f5f3f0] border border-[#e5e5e0]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#4a4a4a]">
                            {note.userName || '未知用户'}
                          </span>
                          <span className="text-xs text-[#a8a8a0]">
                            {new Date(note.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#4a4a4a] whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>会议材料</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-[#a8a8a0] mb-4">暂无上传的会议材料</p>
              <Button variant="primary">上传材料</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
