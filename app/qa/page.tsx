'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';
import { ListSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function QAPage() {
  const { user } = useAuthStore();
  const { groups, selectedGroup } = useGroupsStore();
  const { questions, isLoading, fetchQuestions, createQuestion } = useQuestionsStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (selectedGroup) {
      fetchQuestions(selectedGroup.id);
    }
  }, [selectedGroup, fetchQuestions]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedGroup) return;

    await createQuestion({
      groupId: selectedGroup.id,
      userId: user?.id,
      title,
      content,
      isAnonymous,
    });

    setTitle('');
    setContent('');
    setIsAnonymous(false);
    setShowCreateModal(false);
  };

  if (!selectedGroup) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-[#4a4a4a]">选择一个课题组</h2>
            <p className="text-[#a8a8a0] max-w-md">
              请先在课题组页面选择一个课题组，然后就可以在这里提问和回答问题了
            </p>
            <Link href="/groups">
              <Button variant="primary">前往课题组</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">问答区</h1>
            <p className="text-[#a8a8a0] mt-1">
              {selectedGroup.name} - 提问和分享知识
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            提问
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <ListSkeleton count={5} />
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#a8a8a0] mb-4">还没有问题，来提第一个问题吧！</p>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  提问
                </Button>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => {
              const author = question.isAnonymous ? null : getUserById(question.userId);
              return (
                <Link key={question.id} href={`/qa/${question.id}`}>
                  <Card hover>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#b8c5b0] flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                          {question.isAnonymous ? '?' : author?.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-[#4a4a4a]">
                              {question.title}
                            </h3>
                            {question.isAnonymous && <Badge variant="default">匿名</Badge>}
                          </div>
                          <p className="text-sm text-[#a8a8a0] mb-3 line-clamp-2">
                            {question.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#a8a8a0]">
                            <span>
                              {question.isAnonymous ? '匿名用户' : author?.name}
                            </span>
                            <span>·</span>
                            <span>{new Date(question.createdAt).toLocaleString('zh-CN')}</span>
                            <span>·</span>
                            <span>{question.replies.length} 回复</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>提问</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                    问题标题
                  </label>
                  <Input
                    placeholder="简明扼要地描述你的问题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                    问题详情
                  </label>
                  <Textarea
                    placeholder="详细描述你的问题..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[#9db4c0] rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-[#4a4a4a]">
                    匿名提问
                  </label>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="primary">
                    发布问题
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
