import { create } from 'zustand';
import type { MeetingNote } from '@/lib/types';

interface MeetingNotesState {
  notes: MeetingNote[];
  isLoading: boolean;
  fetchNotes: (meetingId: string) => Promise<void>;
  addNote: (meetingId: string, content: string) => Promise<void>;
}

export const useMeetingNotesStore = create<MeetingNotesState>((set, get) => ({
  notes: [],
  isLoading: false,

  fetchNotes: async (meetingId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/meetings/${meetingId}/notes`);
      const data = await response.json();

      if (data.notes) {
        set({
          notes: data.notes.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            updatedAt: new Date(n.updatedAt),
          })),
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Fetch notes error:', error);
      set({ isLoading: false });
    }
  },

  addNote: async (meetingId: string, content: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add note failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to add note');
      }

      const result = await response.json();
      const newNote: MeetingNote = {
        ...result.note,
        createdAt: new Date(result.note.createdAt),
        updatedAt: new Date(result.note.updatedAt),
      };

      set({ notes: [newNote, ...get().notes] });
    } catch (error) {
      console.error('Add note error:', error);
      throw error;
    }
  },
}));
