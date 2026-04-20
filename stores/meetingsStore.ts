import { create } from 'zustand';

interface Meeting {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  endTime: Date;
  location?: string;
  status: string;
  summary?: string;
  createdBy: string;
  createdAt: Date;
}

interface MeetingsState {
  meetings: Meeting[];
  isLoading: boolean;
  fetchMeetings: (groupId?: string) => Promise<void>;
  createMeeting: (data: Partial<Meeting>) => Promise<void>;
}

export const useMeetingsStore = create<MeetingsState>((set) => ({
  meetings: [],
  isLoading: false,

  fetchMeetings: async (groupId?: string) => {
    set({ isLoading: true });
    try {
      const url = groupId ? `/api/meetings?groupId=${groupId}` : '/api/meetings';
      const res = await fetch(url);
      const data = await res.json();
      set({ meetings: data.meetings || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      set({ isLoading: false });
    }
  },

  createMeeting: async (data) => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.meeting) {
        set((state) => ({
          meetings: [result.meeting, ...state.meetings],
        }));
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  },
}));
