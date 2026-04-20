import { create } from 'zustand';
import type { Question, QuestionReply } from '@/lib/types';
import { mockQuestions } from '@/lib/mock-data';

interface QuestionsState {
  questions: Question[];
  isLoading: boolean;
  fetchQuestions: (groupId?: string) => Promise<void>;
  createQuestion: (data: Partial<Question>) => Promise<void>;
  addReply: (questionId: string, content: string, userId: string) => Promise<void>;
}

// 问答状态管理
export const useQuestionsStore = create<QuestionsState>((set, get) => ({
  questions: [],
  isLoading: false,

  fetchQuestions: async (groupId?: string) => {
    set({ isLoading: true });
    try {
      const url = groupId ? `/api/questions?groupId=${groupId}` : '/api/questions';
      const response = await fetch(url);
      const data = await response.json();

      if (data.questions) {
        const questions = await Promise.all(
          data.questions.map(async (q: any) => {
            // 获取每个问题的回复
            try {
              const repliesRes = await fetch(`/api/questions/${q.id}/replies`);
              const repliesData = await repliesRes.json();
              return {
                ...q,
                createdAt: new Date(q.createdAt),
                replies: repliesData.replies
                  ? repliesData.replies.map((r: any) => ({
                      ...r,
                      createdAt: new Date(r.createdAt),
                    }))
                  : [],
              };
            } catch (error) {
              console.error(`Fetch replies for question ${q.id} error:`, error);
              return {
                ...q,
                createdAt: new Date(q.createdAt),
                replies: [],
              };
            }
          })
        );

        set({ questions, isLoading: false });
      }
    } catch (error) {
      console.error('Fetch questions error:', error);
      set({ isLoading: false });
    }
  },

  createQuestion: async (data: Partial<Question>) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create question');
      }

      const result = await response.json();
      const newQuestion: Question = {
        ...result.question,
        createdAt: new Date(result.question.createdAt),
        replies: [],
      };

      set({ questions: [...get().questions, newQuestion] });
    } catch (error) {
      console.error('Create question error:', error);
      throw error;
    }
  },

  addReply: async (questionId: string, content: string, userId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      const result = await response.json();
      const newReply: QuestionReply = {
        ...result.reply,
        createdAt: new Date(result.reply.createdAt),
      };

      set({
        questions: get().questions.map(q =>
          q.id === questionId
            ? { ...q, replies: [...q.replies, newReply] }
            : q
        ),
      });
    } catch (error) {
      console.error('Add reply error:', error);
      throw error;
    }
  },
}));
