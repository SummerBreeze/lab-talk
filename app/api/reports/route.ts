import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { weeklyReports, comments } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and, or } from 'drizzle-orm';

// GET /api/reports?groupId=xxx - 获取周报列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    let reportsList;

    if (groupId) {
      // 根据权限过滤：自己的报告 + 组内可见的报告 + (教师可见所有)
      if (session.role === 'teacher') {
        reportsList = await db
          .select()
          .from(weeklyReports)
          .where(eq(weeklyReports.groupId, groupId));
      } else {
        reportsList = await db
          .select()
          .from(weeklyReports)
          .where(
            and(
              eq(weeklyReports.groupId, groupId),
              or(
                eq(weeklyReports.userId, session.userId),
                eq(weeklyReports.visibility, 'group')
              )
            )
          );
      }
    } else {
      // 教师可以看到所有已提交的周报，学生只能看到自己的
      if (session.role === 'teacher') {
        reportsList = await db
          .select()
          .from(weeklyReports)
          .where(eq(weeklyReports.isSubmitted, true));
      } else {
        reportsList = await db
          .select()
          .from(weeklyReports)
          .where(eq(weeklyReports.userId, session.userId));
      }
    }

    return NextResponse.json({ reports: reportsList });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: '获取周报失败' },
      { status: 500 }
    );
  }
}

// POST /api/reports - 创建周报
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { groupId, title, content, visibility } = await request.json();

    if (!groupId || !title || !content) {
      return NextResponse.json(
        { error: '课题组、标题和内容是必填的' },
        { status: 400 }
      );
    }

    const [newReport] = await db
      .insert(weeklyReports)
      .values({
        userId: session.userId,
        groupId,
        title,
        content,
        visibility: visibility || 'private',
        isSubmitted: false,
      })
      .returning();

    return NextResponse.json({ report: newReport });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: '创建周报失败' },
      { status: 500 }
    );
  }
}
