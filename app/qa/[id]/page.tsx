'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const { user } = useAuthStore();
  const { questions, fetchQuestions, addReply } = useQuestionsStore();
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestions();
    }
  }, [questions.length, fetchQuestions]);

  const question = questions.find(q => q.id === questionId);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;
    await addReply(questionId, replyContent, user.id);
    setReplyContent('');
  };

  if (!question) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#a8a8a0]">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  const author = question.isAnonymous ? null : getUserById(question.userId);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 返回
        </Button>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#b8c5b0] flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                {question.isAnonymous ? '?' : author?.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="text-2xl font-bold text-[#4a4a4a]">{question.title}</h1>
                  {question.isAnonymous && <Badge variant="default">匿名</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm text-[#a8a8a0] mb-4">
                  <span>{question.isAnonymous ? '匿名用户' : author?.name}</span>
                  <span>·</span>
                  <span>{new Date(question.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">
                  {question.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>回复 ({question.replies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddReply} className="mb-6">
              <Textarea
                placeholder="写下你的回复..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
              />
              <Button type="submit" variant="primary" className="mt-3">
                发表回复
              </Button>
            </form>

            {question.replies.length === 0 ? (
              <p className="text-sm text-[#a8a8a0] text-center py-8">暂无回复，来抢沙发吧！</p>
            ) : (
              <div className="space-y-4">
                {question.replies.map((reply) => {
                  const replyAuthor = getUserById(reply.userId);
                  return (
                    <div
                      key={reply.id}
                      className="p-4 rounded-lg border border-[#d8d4cc] bg-[#f5f3f0]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9db4c0] flex items-center justify-center text-white font-medium flex-shrink-0">
                          {replyAuthor?.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-[#4a4a4a]">
                              {replyAuthor?.name}
                            </span>
                            <Badge variant={replyAuthor?.role === 'teacher' ? 'info' : 'default'}>
                              {replyAuthor?.role === 'teacher' ? '教师' : '学生'}
                            </Badge>
                            <span className="text-xs text-[#a8a8a0]">
                              {new Date(reply.createdAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm text-[#4a4a4a] whitespace-pre-wrap">
                            {reply.content}
                          </p>
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
