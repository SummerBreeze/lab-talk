import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { weeklyReports, groupMembers, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';
import { createNotifications, NotificationTemplates } from '@/lib/notifications';

// POST /api/reports/[id]/submit - 提交周报
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    // 只能提交自己的周报
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: '周报不存在' }, { status: 404 });
    }

    if (report.userId !== session.userId) {
      return NextResponse.json({ error: '无权提交此周报' }, { status: 403 });
    }

    if (report.isSubmitted) {
      return NextResponse.json({ error: '周报已提交' }, { status: 400 });
    }

    const [submittedReport] = await db
      .update(weeklyReports)
      .set({
        isSubmitted: true,
        submittedAt: new Date(),
      })
      .where(eq(weeklyReports.id, id))
      .returning();

    // 尝试发送通知（如果失败不影响提交）
    try {
      // 获取提交者信息
      const [submitter] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      // 通知课题组的所有教师
      const teachers = await db
        .select({
          userId: groupMembers.userId,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(
          and(
            eq(groupMembers.groupId, report.groupId),
            eq(users.role, 'teacher')
          )
        );

      if (teachers.length > 0 && submitter) {
        await createNotifications(
          teachers.map(teacher => ({
            userId: teacher.userId,
            ...NotificationTemplates.reportSubmitted(
              submitter.name,
              report.title,
              report.id
            ),
          }))
        );
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // 通知失败不影响提交成功
    }

    return NextResponse.json({ report: submittedReport });
  } catch (error) {
    console.error('Submit report error:', error);
    return NextResponse.json(
      { error: '提交周报失败' },
      { status: 500 }
    );
  }
}
