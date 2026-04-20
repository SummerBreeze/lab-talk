'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/qa/QuestionCard';
import { QuestionForm } from '@/components/qa/QuestionForm';
import { useGroupsStore } from '@/stores/groupsStore';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useAuthStore } from '@/stores/authStore';
import { getUserById } from '@/lib/mock-data';

export default function GroupQAPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { user } = useAuthStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { questions, fetchQuestions, createQuestion } = useQuestionsStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
    fetchQuestions(groupId);
  }, [groupId, groups.length, fetchGroups, fetchQuestions]);

  const group = groups.find(g => g.id === groupId);

  const handleCreateQuestion = async (data: { title: string; content: string; isAnonymous: boolean }) => {
    await createQuestion({
      ...data,
      groupId,
      userId: user?.id,
    });
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
          ← 返回课题组
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4a4a4a]">Q&A 问答</h1>
            <p className="text-[#a8a8a0] mt-1">{group?.name}</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '取消' : '提问'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>发起提问</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionForm
                onSubmit={handleCreateQuestion}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[#a8a8a0] mb-4">暂无问题</p>
              <Button variant="primary" onClick={() => setShowForm(true)}>
                发起第一个提问
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => {
              const author = question.isAnonymous ? null : getUserById(question.userId);
              return (
                <QuestionCard
                  key={question.id}
                  title={question.title}
                  content={question.content}
                  authorName={author?.name || '匿名用户'}
                  isAnonymous={question.isAnonymous}
                  createdAt={question.createdAt}
                  replyCount={question.replies.length}
                  onClick={() => router.push(`/qa/${question.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
