import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { inArray } from 'drizzle-orm';
import { cache, CacheKeys } from '@/lib/cache';

// GET /api/users/batch?ids=id1,id2,id3 - 批量获取用户信息
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ error: '缺少ids参数' }, { status: 400 });
    }

    const ids = idsParam.split(',').filter(id => id.trim());

    if (ids.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // 检查缓存
    const cachedUsers: any[] = [];
    const uncachedIds: string[] = [];

    ids.forEach(id => {
      const cached = cache.get(CacheKeys.user(id));
      if (cached) {
        cachedUsers.push(cached);
      } else {
        uncachedIds.push(id);
      }
    });

    // 查询未缓存的用户
    let dbUsers: any[] = [];
    if (uncachedIds.length > 0) {
      dbUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatar: users.avatar,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(inArray(users.id, uncachedIds));

      // 缓存查询结果
      dbUsers.forEach(user => {
        cache.set(CacheKeys.user(user.id), user, 300000); // 5分钟
      });
    }

    const allUsers = [...cachedUsers, ...dbUsers];

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Batch get users error:', error);
    return NextResponse.json(
      { error: '批量获取用户失败' },
      { status: 500 }
    );
  }
}
