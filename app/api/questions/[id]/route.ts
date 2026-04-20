import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { questions } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// GET /api/questions/[id] - 获取问题详情
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
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    return NextResponse.json(
      { error: '获取问题失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/questions/[id] - 更新问题
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

    // 只能更新自己的问题
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    if (question.userId !== session.userId) {
      return NextResponse.json({ error: '无权修改此问题' }, { status: 403 });
    }

    const [updatedQuestion] = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { error: '更新问题失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - 删除问题
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

    // 只能删除自己的问题
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (!question) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    if (question.userId !== session.userId) {
      return NextResponse.json({ error: '无权删除此问题' }, { status: 403 });
    }

    await db.delete(questions).where(eq(questions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { error: '删除问题失败' },
      { status: 500 }
    );
  }
}
