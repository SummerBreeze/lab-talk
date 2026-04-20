import { create } from 'zustand';
import type { Group } from '@/lib/types';
import { mockGroups } from '@/lib/mock-data';

interface GroupsState {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  selectGroup: (groupId: string) => void;
  createGroup: (name: string, description?: string) => Promise<void>;
}

// 课题组状态管理
// 未来可以替换为真实的 API 调用
export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  selectedGroup: null,
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();

      if (data.groups) {
        set({
          groups: data.groups.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
          })),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Fetch groups error:', error);
      set({ isLoading: false });
    }
  },

  selectGroup: (groupId: string) => {
    const group = get().groups.find(g => g.id === groupId);
    set({ selectedGroup: group || null });
  },

  createGroup: async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const data = await response.json();
      const newGroup: Group = {
        ...data.group,
        createdAt: new Date(data.group.createdAt),
        members: [],
      };

      set({ groups: [...get().groups, newGroup] });
    } catch (error) {
      console.error('Create group error:', error);
      throw error;
    }
  },
}));
