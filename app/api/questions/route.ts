import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { questions } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// GET /api/questions?groupId=xxx - 获取问答列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const questionsList = groupId
      ? await db.select().from(questions).where(eq(questions.groupId, groupId))
      : await db.select().from(questions);

    return NextResponse.json({ questions: questionsList });
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { error: '获取问答失败' },
      { status: 500 }
    );
  }
}

// POST /api/questions - 创建问题
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { groupId, title, content, isAnonymous } = await request.json();

    if (!groupId || !title || !content) {
      return NextResponse.json(
        { error: '课题组、标题和内容是必填的' },
        { status: 400 }
      );
    }

    const [newQuestion] = await db
      .insert(questions)
      .values({
        groupId,
        userId: session.userId,
        title,
        content,
        isAnonymous: isAnonymous || false,
      })
      .returning();

    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: '创建问题失败' },
      { status: 500 }
    );
  }
}
