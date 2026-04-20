import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { comments, weeklyReports, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { createNotification, NotificationTemplates } from '@/lib/notifications';

// GET /api/reports/[id]/comments - 获取周报评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    // 检查周报是否存在及权限
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: '周报不存在' }, { status: 404 });
    }

    const canView =
      report.userId === session.userId ||
      session.role === 'teacher' ||
      report.visibility === 'group';

    if (!canView) {
      return NextResponse.json({ error: '无权查看此周报' }, { status: 403 });
    }

    const commentsList = await db
      .select()
      .from(comments)
      .where(eq(comments.reportId, id));

    return NextResponse.json({ comments: commentsList });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// POST /api/reports/[id]/comments - 添加评论
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
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      );
    }

    // 检查周报是否存在及权限
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: '周报不存在' }, { status: 404 });
    }

    const canComment =
      report.userId === session.userId ||
      session.role === 'teacher' ||
      report.visibility === 'group';

    if (!canComment) {
      return NextResponse.json({ error: '无权评论此周报' }, { status: 403 });
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        reportId: id,
        userId: session.userId,
        content,
      })
      .returning();

    // 创建通知（如果不是作者自己评论）
    if (report.userId !== session.userId) {
      const [commenter] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (commenter) {
        await createNotification({
          userId: report.userId,
          ...NotificationTemplates.reportCommented(
            report.title,
            commenter.name,
            report.id
          ),
        });
      }
    }

    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: '添加评论失败' },
      { status: 500 }
    );
  }
}
