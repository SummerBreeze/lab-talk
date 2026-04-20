import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { meetings } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// GET /api/meetings/[id] - 获取组会详情
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
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, id))
      .limit(1);

    if (!meeting) {
      return NextResponse.json({ error: '组会不存在' }, { status: 404 });
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    return NextResponse.json(
      { error: '获取组会失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/meetings/[id] - 更新组会
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

    const [updatedMeeting] = await db
      .update(meetings)
      .set(updates)
      .where(eq(meetings.id, id))
      .returning();

    return NextResponse.json({ meeting: updatedMeeting });
  } catch (error) {
    console.error('Update meeting error:', error);
    return NextResponse.json(
      { error: '更新组会失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - 删除组会
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
    await db.delete(meetings).where(eq(meetings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return NextResponse.json(
      { error: '删除组会失败' },
      { status: 500 }
    );
  }
}
