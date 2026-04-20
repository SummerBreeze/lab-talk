import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { meetingNotes, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

// GET /api/meetings/[id]/notes - 获取会议笔记列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id: meetingId } = await params;

    const notesWithUsers = await db
      .select({
        id: meetingNotes.id,
        meetingId: meetingNotes.meetingId,
        userId: meetingNotes.userId,
        content: meetingNotes.content,
        createdAt: meetingNotes.createdAt,
        updatedAt: meetingNotes.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(meetingNotes)
      .leftJoin(users, eq(meetingNotes.userId, users.id))
      .where(eq(meetingNotes.meetingId, meetingId))
      .orderBy(desc(meetingNotes.createdAt));

    return NextResponse.json({ notes: notesWithUsers });
  } catch (error) {
    console.error('Get meeting notes error:', error);
    return NextResponse.json(
      { error: '获取笔记失败' },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[id]/notes - 创建或更新笔记
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id: meetingId } = await params;
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '笔记内容不能为空' },
        { status: 400 }
      );
    }

    const [newNote] = await db
      .insert(meetingNotes)
      .values({
        meetingId,
        userId: session.userId,
        content,
      })
      .returning();

    return NextResponse.json({ note: newNote });
  } catch (error) {
    console.error('Create meeting note error:', error);
    return NextResponse.json(
      { error: '创建笔记失败' },
      { status: 500 }
    );
  }
}
