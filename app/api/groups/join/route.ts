import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { groups, groupMembers } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

// POST /api/groups/join - 通过邀请码加入课题组
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: '邀请码是必填的' },
        { status: 400 }
      );
    }

    // 查找课题组
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.inviteCode, inviteCode.toUpperCase()))
      .limit(1);

    if (!group) {
      return NextResponse.json(
        { error: '邀请码无效' },
        { status: 404 }
      );
    }

    // 检查是否已经是成员
    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, session.userId),
          eq(groupMembers.groupId, group.id)
        )
      )
      .limit(1);

    if (existingMember) {
      return NextResponse.json(
        { error: '你已经是该课题组的成员' },
        { status: 400 }
      );
    }

    // 添加成员
    await db.insert(groupMembers).values({
      userId: session.userId,
      groupId: group.id,
      role: session.role,
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json(
      { error: '加入课题组失败' },
      { status: 500 }
    );
  }
}
