import { create } from 'zustand';
import type { Task } from '@/lib/types';
import { mockTasks } from '@/lib/mock-data';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (groupId?: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
}

// 任务状态管理
export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (groupId?: string) => {
    set({ isLoading: true });
    try {
      const url = groupId ? `/api/tasks?groupId=${groupId}` : '/api/tasks';
      const response = await fetch(url);
      const data = await response.json();

      if (data.tasks) {
        set({
          tasks: data.tasks.map((t: any) => ({
            ...t,
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            createdAt: new Date(t.createdAt),
          })),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      set({ isLoading: false });
    }
  },

  createTask: async (data: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const result = await response.json();
      const newTask: Task = {
        ...result.task,
        dueDate: result.task.dueDate ? new Date(result.task.dueDate) : undefined,
        createdAt: new Date(result.task.createdAt),
      };

      set({ tasks: [...get().tasks, newTask] });
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  toggleTaskComplete: async (taskId: string) => {
    try {
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle task');
      }

      const result = await response.json();
      set({
        tasks: get().tasks.map(t =>
          t.id === taskId
            ? {
                ...result.task,
                dueDate: result.task.dueDate ? new Date(result.task.dueDate) : undefined,
                createdAt: new Date(result.task.createdAt),
              }
            : t
        ),
      });
    } catch (error) {
      console.error('Toggle task error:', error);
      throw error;
    }
  },
}));
