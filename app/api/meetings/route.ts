import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { meetings } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

// GET /api/meetings?groupId=xxx - 获取组会列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const meetingsList = groupId
      ? await db.select().from(meetings).where(eq(meetings.groupId, groupId))
      : await db.select().from(meetings);

    return NextResponse.json({ meetings: meetingsList });
  } catch (error) {
    console.error('Get meetings error:', error);
    return NextResponse.json(
      { error: '获取组会失败' },
      { status: 500 }
    );
  }
}

// POST /api/meetings - 创建组会
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { groupId, title, description, scheduledAt, endTime, location } = await request.json();

    if (!groupId || !title || !scheduledAt || !endTime) {
      return NextResponse.json(
        { error: '课题组、标题、开始时间和结束时间是必填的' },
        { status: 400 }
      );
    }

    const [newMeeting] = await db
      .insert(meetings)
      .values({
        groupId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        endTime: new Date(endTime),
        location,
        status: 'upcoming',
        createdBy: session.userId,
      })
      .returning();

    return NextResponse.json({ meeting: newMeeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    return NextResponse.json(
      { error: '创建组会失败' },
      { status: 500 }
    );
  }
}
