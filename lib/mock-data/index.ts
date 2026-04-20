import type { User, Group, Meeting, WeeklyReport, Comment, Question, QuestionReply, Task, Notification } from '@/lib/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'teacher@example.com',
    name: '张教授',
    role: 'teacher',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'student1@example.com',
    name: '李明',
    role: 'student',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    email: 'student2@example.com',
    name: '王芳',
    role: 'student',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    email: 'student3@example.com',
    name: '刘强',
    role: 'student',
    createdAt: new Date('2024-02-01'),
  },
];

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: '1',
    name: '人工智能研究组',
    description: '专注于深度学习和计算机视觉研究',
    inviteCode: 'AI2024',
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    members: [
      { userId: '1', groupId: '1', role: 'teacher', joinedAt: new Date('2024-01-01') },
      { userId: '2', groupId: '1', role: 'student', joinedAt: new Date('2024-01-15') },
      { userId: '3', groupId: '1', role: 'student', joinedAt: new Date('2024-01-20') },
    ],
  },
  {
    id: '2',
    name: '自然语言处理组',
    description: '研究大语言模型和文本生成',
    inviteCode: 'NLP2024',
    createdBy: '1',
    createdAt: new Date('2024-02-01'),
    members: [
      { userId: '1', groupId: '2', role: 'teacher', joinedAt: new Date('2024-02-01') },
      { userId: '4', groupId: '2', role: 'student', joinedAt: new Date('2024-02-01') },
    ],
  },
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: '1',
    groupId: '1',
    title: '周例会 - 项目进度汇报',
    description: '讨论本周研究进展和下周计划',
    scheduledAt: new Date('2024-04-22T14:00:00'),
    endTime: new Date('2024-04-22T16:00:00'),
    location: '实验室 A301',
    status: 'upcoming',
    createdBy: '1',
    createdAt: new Date('2024-04-15'),
  },
  {
    id: '2',
    groupId: '1',
    title: '论文研讨会',
    description: '分享最新的 CVPR 2024 论文',
    scheduledAt: new Date('2024-04-25T10:00:00'),
    endTime: new Date('2024-04-25T12:00:00'),
    location: '会议室 B205',
    status: 'upcoming',
    createdBy: '1',
    createdAt: new Date('2024-04-18'),
  },
];

// Mock Weekly Reports
export const mockReports: WeeklyReport[] = [
  {
    id: '1',
    userId: '2',
    groupId: '1',
    title: '第8周周报 - 模型训练进展',
    content: '本周完成了基础模型的训练，准确率达到85%。下周计划优化超参数。',
    visibility: 'group',
    isSubmitted: true,
    submittedAt: new Date('2024-04-14'),
    createdAt: new Date('2024-04-13'),
    updatedAt: new Date('2024-04-14'),
  },
  {
    id: '2',
    userId: '3',
    groupId: '1',
    title: '第8周周报 - 数据集整理',
    content: '完成了数据集的清洗和标注工作，共处理5000张图片。',
    visibility: 'teacher',
    isSubmitted: true,
    submittedAt: new Date('2024-04-15'),
    createdAt: new Date('2024-04-14'),
    updatedAt: new Date('2024-04-15'),
  },
  {
    id: '3',
    userId: '2',
    groupId: '1',
    title: '第9周周报（草稿）',
    content: '本周继续进行模型优化...',
    visibility: 'private',
    isSubmitted: false,
    createdAt: new Date('2024-04-19'),
    updatedAt: new Date('2024-04-19'),
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: '1',
    reportId: '1',
    userId: '1',
    content: '做得不错！建议下周可以尝试使用学习率衰减策略。',
    createdAt: new Date('2024-04-15T09:30:00'),
  },
  {
    id: '2',
    reportId: '2',
    userId: '1',
    content: '数据标注质量很高，继续保持。',
    createdAt: new Date('2024-04-16T10:00:00'),
  },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: '1',
    groupId: '1',
    userId: '2',
    title: '关于损失函数的选择',
    content: '在多分类任务中，CrossEntropy 和 Focal Loss 该如何选择？',
    isAnonymous: false,
    createdAt: new Date('2024-04-16T14:20:00'),
    replies: [
      {
        id: '1',
        questionId: '1',
        userId: '1',
        content: '如果类别不平衡严重，建议使用 Focal Loss。否则 CrossEntropy 就足够了。',
        isAnonymous: false,
        createdAt: new Date('2024-04-16T15:00:00'),
      },
    ],
  },
  {
    id: '2',
    groupId: '1',
    userId: '3',
    title: '服务器 GPU 使用问题',
    content: '最近服务器经常显示 GPU 内存不足，有什么解决办法吗？',
    isAnonymous: true,
    createdAt: new Date('2024-04-17T11:00:00'),
    replies: [],
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    groupId: '1',
    meetingId: '1',
    title: '完成模型评估报告',
    description: '对比不同模型在测试集上的表现',
    assignedTo: '2',
    createdBy: '1',
    dueDate: new Date('2024-04-28'),
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date('2024-04-15'),
  },
  {
    id: '2',
    groupId: '1',
    title: '准备论文研讨材料',
    description: '阅读并总结 3 篇相关论文',
    assignedTo: '3',
    createdBy: '1',
    dueDate: new Date('2024-04-24'),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date('2024-04-18'),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    type: 'meeting',
    title: '新组会通知',
    content: '张教授创建了新的组会：周例会 - 项目进度汇报',
    link: '/meetings/1',
    isRead: false,
    createdAt: new Date('2024-04-15T10:00:00'),
  },
  {
    id: '2',
    userId: '2',
    type: 'comment',
    title: '周报收到新评论',
    content: '张教授评论了你的周报',
    link: '/reports/1',
    isRead: false,
    createdAt: new Date('2024-04-15T09:30:00'),
  },
  {
    id: '3',
    userId: '2',
    type: 'task',
    title: '新任务分配',
    content: '你被分配了新任务：完成模型评估报告',
    link: '/tasks',
    isRead: true,
    createdAt: new Date('2024-04-15T08:00:00'),
  },
];

// Helper function to get user by id
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get group by id
export const getGroupById = (id: string): Group | undefined => {
  return mockGroups.find(group => group.id === id);
};
