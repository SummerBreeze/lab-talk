// User types
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
  members: GroupMember[];
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: UserRole;
  joinedAt: Date;
}

// Meeting types
export type MeetingStatus = 'upcoming' | 'in_progress' | 'completed';

export interface Meeting {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  endTime: Date;
  location?: string;
  status: MeetingStatus;
  summary?: string;
  createdBy: string;
  createdAt: Date;
}

// Weekly Report types
export type ReportVisibility = 'private' | 'group' | 'teacher';

export interface WeeklyReport {
  id: string;
  userId: string;
  groupId: string;
  title: string;
  content: string;
  visibility: ReportVisibility;
  isSubmitted: boolean;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// Q&A types
export interface Question {
  id: string;
  groupId: string;
  userId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  replies: QuestionReply[];
}

export interface QuestionReply {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

// Task types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  groupId: string;
  meetingId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  createdBy: string;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
}

// Notification types
export type NotificationType = 'meeting' | 'comment' | 'task' | 'material';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// Meeting Note types
export interface MeetingNote {
  id: string;
  meetingId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userName?: string;
  userEmail?: string;
}
