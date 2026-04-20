import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { tasks } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// GET /api/tasks?groupId=xxx - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const tasksList = groupId
      ? await db.select().from(tasks).where(eq(tasks.groupId, groupId))
      : await db.select().from(tasks);

    return NextResponse.json({ tasks: tasksList });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: '获取任务失败' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - 创建任务
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { groupId, title, description, assignedTo, dueDate, priority } = await request.json();

    if (!groupId || !title) {
      return NextResponse.json(
        { error: '课题组和标题是必填的' },
        { status: 400 }
      );
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        groupId,
        title,
        description,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        status: 'pending',
        createdBy: session.userId,
      })
      .returning();

    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    );
  }
}
