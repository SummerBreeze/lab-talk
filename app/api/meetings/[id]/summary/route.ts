import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { meetings, meetingNotes, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, desc } from 'drizzle-orm';

// POST /api/meetings/[id]/summary - 生成会议总结
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

    // 获取会议信息
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .limit(1);

    if (!meeting) {
      return NextResponse.json({ error: '会议不存在' }, { status: 404 });
    }

    // 获取会议笔记
    const notesWithUsers = await db
      .select({
        content: meetingNotes.content,
        userName: users.name,
        createdAt: meetingNotes.createdAt,
      })
      .from(meetingNotes)
      .leftJoin(users, eq(meetingNotes.userId, users.id))
      .where(eq(meetingNotes.meetingId, meetingId))
      .orderBy(desc(meetingNotes.createdAt));

    if (notesWithUsers.length === 0) {
      return NextResponse.json(
        { error: '暂无会议笔记，无法生成总结' },
        { status: 400 }
      );
    }

    // 构建笔记内容
    const notesContent = notesWithUsers
      .map((note) => `${note.userName}: ${note.content}`)
      .join('\n\n');

    // 调用阿里百炼API
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI服务未配置' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的会议助手，擅长总结会议内容。请根据会议笔记生成简洁、结构化的会议总结。',
            },
            {
              role: 'user',
              content: `请总结以下会议笔记，生成一份简洁的会议总结。会议标题：${meeting.title}\n\n会议笔记：\n${notesContent}`,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API error:', errorData);
      return NextResponse.json(
        { error: 'AI服务调用失败' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content || '生成总结失败';

    // 保存总结到数据库
    await db
      .update(meetings)
      .set({ summary })
      .where(eq(meetings.id, meetingId));

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    return NextResponse.json(
      { error: '生成总结失败' },
      { status: 500 }
    );
  }
}
