import { create } from 'zustand';
import type { WeeklyReport, Comment } from '@/lib/types';

interface ReportsState {
  reports: WeeklyReport[];
  comments: Record<string, Comment[]>;
  isLoading: boolean;
  lastFetchTime: number;
  fetchReports: (groupId?: string, force?: boolean) => Promise<void>;
  createReport: (data: Partial<WeeklyReport>) => Promise<void>;
  submitReport: (reportId: string) => Promise<void>;
  addComment: (reportId: string, content: string) => Promise<void>;
  startAutoRefresh: (groupId?: string, interval?: number) => void;
  stopAutoRefresh: () => void;
}

let refreshInterval: NodeJS.Timeout | null = null;

// 周报状态管理
export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  comments: {},
  isLoading: false,
  lastFetchTime: 0,

  fetchReports: async (groupId?: string, force = false) => {
    const now = Date.now();
    const { lastFetchTime } = get();

    // 如果不是强制刷新，且距离上次获取不到5秒，则跳过
    if (!force && now - lastFetchTime < 5000) {
      return;
    }

    set({ isLoading: true });
    try {
      const url = groupId ? `/api/reports?groupId=${groupId}` : '/api/reports';
      const response = await fetch(url);
      const data = await response.json();

      if (data.reports) {
        const reports = data.reports.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
          submittedAt: r.submittedAt ? new Date(r.submittedAt) : undefined,
        }));

        // 加载每个报告的评论
        const commentsMap: Record<string, Comment[]> = {};
        await Promise.all(
          reports.map(async (report: WeeklyReport) => {
            try {
              const commentsRes = await fetch(`/api/reports/${report.id}/comments`);
              const commentsData = await commentsRes.json();
              if (commentsData.comments) {
                commentsMap[report.id] = commentsData.comments.map((c: any) => ({
                  ...c,
                  createdAt: new Date(c.createdAt),
                }));
              }
            } catch (error) {
              console.error(`Fetch comments for report ${report.id} error:`, error);
              commentsMap[report.id] = [];
            }
          })
        );

        set({
          reports,
          comments: commentsMap,
          isLoading: false,
          lastFetchTime: now,
        });
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      set({ isLoading: false });
    }
  },

  createReport: async (data: Partial<WeeklyReport>) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const result = await response.json();
      const newReport: WeeklyReport = {
        ...result.report,
        createdAt: new Date(result.report.createdAt),
        updatedAt: new Date(result.report.updatedAt),
      };

      set({ reports: [...get().reports, newReport] });
    } catch (error) {
      console.error('Create report error:', error);
      throw error;
    }
  },

  submitReport: async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/submit`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const result = await response.json();
      set({
        reports: get().reports.map(r =>
          r.id === reportId
            ? {
                ...result.report,
                createdAt: new Date(result.report.createdAt),
                updatedAt: new Date(result.report.updatedAt),
                submittedAt: result.report.submittedAt ? new Date(result.report.submittedAt) : undefined,
              }
            : r
        ),
      });
    } catch (error) {
      console.error('Submit report error:', error);
      throw error;
    }
  },

  addComment: async (reportId: string, content: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const result = await response.json();
      const newComment: Comment = {
        ...result.comment,
        createdAt: new Date(result.comment.createdAt),
      };

      set({
        comments: {
          ...get().comments,
          [reportId]: [...(get().comments[reportId] || []), newComment],
        },
      });
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  // 开始自动刷新（用于教师端实时查看新周报）
  startAutoRefresh: (groupId?: string, interval = 10000) => {
    // 先停止之前的定时器
    get().stopAutoRefresh();

    // 立即获取一次
    get().fetchReports(groupId, true);

    // 设置定时刷新
    refreshInterval = setInterval(() => {
      get().fetchReports(groupId, true);
    }, interval);
  },

  // 停止自动刷新
  stopAutoRefresh: () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  },
}));
