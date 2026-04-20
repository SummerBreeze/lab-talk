import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { replies } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// GET /api/questions/[id]/replies - 获取问题的回复列表
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

    const repliesList = await db
      .select()
      .from(replies)
      .where(eq(replies.questionId, id));

    return NextResponse.json({ replies: repliesList });
  } catch (error) {
    console.error('Get replies error:', error);
    return NextResponse.json(
      { error: '获取回复失败' },
      { status: 500 }
    );
  }
}

// POST /api/questions/[id]/replies - 添加回复
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
    const { content, isAnonymous } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: '回复内容不能为空' },
        { status: 400 }
      );
    }

    const [newReply] = await db
      .insert(replies)
      .values({
        questionId: id,
        userId: session.userId,
        content,
        isAnonymous: isAnonymous || false,
      })
      .returning();

    return NextResponse.json({ reply: newReply });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json(
      { error: '添加回复失败' },
      { status: 500 }
    );
  }
}
