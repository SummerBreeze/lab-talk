import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { weeklyReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and, or } from 'drizzle-orm';

// GET /api/reports/[id] - 获取周报详情
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
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: '周报不存在' }, { status: 404 });
    }

    // 权限检查：自己的报告 + 组内可见 + 教师可见所有
    const canView =
      report.userId === session.userId ||
      session.role === 'teacher' ||
      report.visibility === 'group';

    if (!canView) {
      return NextResponse.json({ error: '无权查看此周报' }, { status: 403 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: '获取周报失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/reports/[id] - 更新周报
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    // 只能更新自己的周报
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: '周报不存在' }, { status: 404 });
    }

    if (report.userId !== session.userId) {
      return NextResponse.json({ error: '无权修改此周报' }, { status: 403 });
    }

    const [updatedReport] = await db
      .update(weeklyReports)
      .set(updates)
      .where(eq(weeklyReports.id, id))
      .returning();

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: '更新周报失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - 删除周报
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    // 只能删除自己的周报
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: '周报不存在' }, { status: 404 });
    }

    if (report.userId !== session.userId) {
      return NextResponse.json({ error: '无权删除此周报' }, { status: 403 });
    }

    await db.delete(weeklyReports).where(eq(weeklyReports.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: '删除周报失败' },
      { status: 500 }
    );
  }
}
