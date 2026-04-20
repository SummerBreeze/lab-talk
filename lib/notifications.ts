import { db } from '@/db/drizzle';
import { notifications } from '@/db/schema';

export type NotificationType = 'meeting' | 'comment' | 'task' | 'material' | 'report' | 'mention' | 'system';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
}

// 创建通知的辅助函数
export async function createNotification(params: CreateNotificationParams) {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        link: params.link,
        isRead: false,
      })
      .returning();

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}

// 批量创建通知
export async function createNotifications(notificationsList: CreateNotificationParams[]) {
  try {
    const result = await db
      .insert(notifications)
      .values(
        notificationsList.map(params => ({
          userId: params.userId,
          type: params.type,
          title: params.title,
          content: params.content,
          link: params.link,
          isRead: false,
        }))
      )
      .returning();

    return result;
  } catch (error) {
    console.error('Create notifications error:', error);
    throw error;
  }
}

// 通知模板
export const NotificationTemplates = {
  // 会议相关
  meetingCreated: (meetingTitle: string, meetingId: string) => ({
    type: 'meeting' as NotificationType,
    title: '新会议通知',
    content: `新会议"${meetingTitle}"已创建`,
    link: `/meetings/${meetingId}`,
  }),

  meetingStarting: (meetingTitle: string, meetingId: string) => ({
    type: 'meeting' as NotificationType,
    title: '会议即将开始',
    content: `会议"${meetingTitle}"将在15分钟后开始`,
    link: `/meetings/${meetingId}`,
  }),

  // 评论相关
  reportCommented: (reportTitle: string, commenterName: string, reportId: string) => ({
    type: 'comment' as NotificationType,
    title: '新评论',
    content: `${commenterName}评论了你的周报"${reportTitle}"`,
    link: `/reports/${reportId}`,
  }),

  // 任务相关
  taskAssigned: (taskTitle: string, taskId: string) => ({
    type: 'task' as NotificationType,
    title: '新任务分配',
    content: `你被分配了新任务"${taskTitle}"`,
    link: `/tasks/${taskId}`,
  }),

  // 周报相关
  reportSubmitted: (userName: string, reportTitle: string, reportId: string) => ({
    type: 'report' as NotificationType,
    title: '周报提交',
    content: `${userName}提交了周报"${reportTitle}"`,
    link: `/reports/${reportId}`,
  }),

  // 系统通知
  systemNotification: (content: string, link?: string) => ({
    type: 'system' as NotificationType,
    title: '系统通知',
    content,
    link,
  }),
};
