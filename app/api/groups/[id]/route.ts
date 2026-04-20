import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { groups, groupMembers, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// GET /api/groups/[id] - 获取课题组详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id: groupId } = await params;

    // 获取课题组信息
    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        inviteCode: groups.inviteCode,
        createdBy: groups.createdBy,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: '课题组不存在' }, { status: 404 });
    }

    // 获取课题组成员
    const members = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        groupId: groupMembers.groupId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));

    return NextResponse.json({
      group: {
        ...group,
        members,
      },
    });
  } catch (error) {
    console.error('Get group error:', error);
    return NextResponse.json(
      { error: '获取课题组信息失败' },
      { status: 500 }
    );
  }
}
