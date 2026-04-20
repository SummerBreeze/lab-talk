import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { groups, groupMembers, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { generateInviteCode } from '@/lib/utils/invite-code';
import { eq } from 'drizzle-orm';

// GET /api/groups - 获取用户所在的所有课题组
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户所在的所有课题组
    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        inviteCode: groups.inviteCode,
        createdBy: groups.createdBy,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, session.userId));

    // 获取每个课题组的成员
    const groupsWithMembers = await Promise.all(
      userGroups.map(async (group) => {
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
          .where(eq(groupMembers.groupId, group.id));

        return {
          ...group,
          members,
        };
      })
    );

    return NextResponse.json({ groups: groupsWithMembers });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: '获取课题组失败' },
      { status: 500 }
    );
  }
}

// POST /api/groups - 创建新课题组
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 只有教师可以创建课题组
    if (session.role !== 'teacher') {
      return NextResponse.json(
        { error: '只有教师可以创建课题组' },
        { status: 403 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: '课题组名称是必填的' },
        { status: 400 }
      );
    }

    // 生成唯一邀请码
    let inviteCode = generateInviteCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await db
        .select()
        .from(groups)
        .where(eq(groups.inviteCode, inviteCode))
        .limit(1);

      if (existing.length === 0) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    // 创建课题组
    const [newGroup] = await db
      .insert(groups)
      .values({
        name,
        description,
        inviteCode,
        createdBy: session.userId,
      })
      .returning();

    // 将创建者添加为成员
    await db.insert(groupMembers).values({
      userId: session.userId,
      groupId: newGroup.id,
      role: 'teacher',
    });

    return NextResponse.json({ group: newGroup });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: '创建课题组失败' },
      { status: 500 }
    );
  }
}
