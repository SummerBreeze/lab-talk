import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { notifications } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

// GET /api/notifications - 获取用户通知列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json({ notifications: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: '获取通知失败' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/mark-read - 标记通知为已读
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { error: '标记已读失败' },
      { status: 500 }
    );
  }
}
