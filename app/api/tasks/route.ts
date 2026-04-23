import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { tasks } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, or, and } from 'drizzle-orm';

// GET /api/tasks?groupId=xxx - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    let tasksList;

    if (session.role === 'teacher') {
      // 教师：查看所有任务（可选按课题组过滤）
      tasksList = groupId
        ? await db.select().from(tasks).where(eq(tasks.groupId, groupId))
        : await db.select().from(tasks);
    } else {
      // 学生：只能看到分配给自己的任务
      tasksList = groupId
        ? await db.select().from(tasks).where(
            and(
              eq(tasks.groupId, groupId),
              eq(tasks.assignedTo, session.userId)
            )
          )
        : await db.select().from(tasks).where(eq(tasks.assignedTo, session.userId));
    }

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

    // 只有教师可以创建任务
    if (session.role !== 'teacher') {
      return NextResponse.json(
        { error: '只有教师可以创建任务' },
        { status: 403 }
      );
    }

    const { groupId, title, description, assignedTo, dueDate, priority } = await request.json();

    if (!groupId || !title || !assignedTo) {
      return NextResponse.json(
        { error: '课题组、标题和分配对象是必填的' },
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
