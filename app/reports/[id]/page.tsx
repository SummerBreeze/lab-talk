'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { useReportsStore } from '@/stores/reportsStore';
import { useAuthStore } from '@/stores/authStore';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { user } = useAuthStore();
  const { reports, comments, fetchReports, submitReport, addComment } = useReportsStore();
  const [commentContent, setCommentContent] = useState('');
  const [authorInfo, setAuthorInfo] = useState<any>(null);
  const [commentAuthorsMap, setCommentAuthorsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (reports.length === 0) {
      fetchReports();
    }
  }, [reports.length, fetchReports]);

  const report = reports.find(r => r.id === reportId);
  const reportComments = comments[reportId] || [];

  useEffect(() => {
    if (report && !authorInfo) {
      fetch(`/api/users/${report.userId}`)
        .then(res => res.json())
        .then(data => setAuthorInfo(data.user))
        .catch(err => console.error('Fetch author error:', err));
    }
  }, [report, authorInfo]);

  useEffect(() => {
    reportComments.forEach(async (comment) => {
      if (!commentAuthorsMap[comment.userId]) {
        try {
          const res = await fetch(`/api/users/${comment.userId}`);
          const data = await res.json();
          if (data.user) {
            setCommentAuthorsMap(prev => ({ ...prev, [comment.userId]: data.user }));
          }
        } catch (error) {
          console.error('Fetch comment author error:', error);
        }
      }
    });
  }, [reportComments]);

  const handleSubmitReport = async () => {
    if (window.confirm('确定要提交周报吗？提交后将无法修改。')) {
      await submitReport(reportId);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    await addComment(reportId, commentContent);
    setCommentContent('');
  };

  if (!report) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#a8a8a0]">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isAuthor = user?.id === report.userId;
  const canComment = user?.role === 'teacher';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-[#a8a8a0]">
                  <span>作者：{authorInfo?.name || '加载中...'}</span>
                  <span>·</span>
                  <span>
                    {report.isSubmitted
                      ? `提交于 ${new Date(report.submittedAt!).toLocaleDateString('zh-CN')}`
                      : `更新于 ${new Date(report.updatedAt).toLocaleDateString('zh-CN')}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    report.visibility === 'group'
                      ? 'info'
                      : report.visibility === 'teacher'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {report.visibility === 'group'
                    ? '组内可见'
                    : report.visibility === 'teacher'
                    ? '仅教师'
                    : '私密'}
                </Badge>
                {report.isSubmitted ? (
                  <Badge variant="success">已提交</Badge>
                ) : (
                  <Badge variant="default">草稿</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-[#4a4a4a] whitespace-pre-wrap leading-relaxed">
                {report.content}
              </p>
            </div>

            {isAuthor && !report.isSubmitted && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-[#d8d4cc]">
                <Button variant="primary" onClick={() => router.push(`/reports/${reportId}/edit`)}>
                  编辑
                </Button>
                <Button variant="secondary" onClick={handleSubmitReport}>
                  提交周报
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>评论 ({reportComments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {canComment && report.isSubmitted && (
              <form onSubmit={handleAddComment} className="mb-6">
                <Textarea
                  placeholder="添加评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                />
                <Button type="submit" variant="primary" className="mt-3">
                  发表评论
                </Button>
              </form>
            )}

            {reportComments.length === 0 ? (
              <p className="text-sm text-[#a8a8a0] text-center py-8">暂无评论</p>
            ) : (
              <div className="space-y-4">
                {reportComments.map((comment) => {
                  const commentAuthor = commentAuthorsMap[comment.userId];
                  return (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg border border-[#d8d4cc] bg-[#f5f3f0]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9db4c0] flex items-center justify-center text-white font-medium flex-shrink-0">
                          {commentAuthor?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-[#4a4a4a]">
                              {commentAuthor?.name || '加载中...'}
                            </span>
                            <Badge variant="info">教师</Badge>
                            <span className="text-xs text-[#a8a8a0]">
                              {new Date(comment.createdAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm text-[#4a4a4a]">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
