import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { weeklyReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// POST /api/reports/[id]/submit - 提交周报（临时版本，不发送通知）
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

    return NextResponse.json({ report: submittedReport });
  } catch (error) {
    console.error('Submit report error:', error);
    return NextResponse.json(
      { error: '提交周报失败' },
      { status: 500 }
    );
  }
}
