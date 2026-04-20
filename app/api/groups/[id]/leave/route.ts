import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { groupMembers } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

// DELETE /api/groups/[id]/leave - 退出课题组
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id: groupId } = await params;

    // 删除成员记录
    const result = await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.userId, session.userId),
          eq(groupMembers.groupId, groupId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: '你不是该课题组的成员' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave group error:', error);
    return NextResponse.json(
      { error: '退出课题组失败' },
      { status: 500 }
    );
  }
}
