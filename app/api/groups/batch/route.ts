import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { groups, groupMembers, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { inArray, eq } from 'drizzle-orm';
import { cache, CacheKeys } from '@/lib/cache';

// GET /api/groups/batch?ids=id1,id2,id3 - 批量获取课题组信息
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
      return NextResponse.json({ groups: [] });
    }

    // 检查缓存
    const cachedGroups: any[] = [];
    const uncachedIds: string[] = [];

    ids.forEach(id => {
      const cached = cache.get(CacheKeys.group(id));
      if (cached) {
        cachedGroups.push(cached);
      } else {
        uncachedIds.push(id);
      }
    });

    // 查询未缓存的课题组
    let dbGroups: any[] = [];
    if (uncachedIds.length > 0) {
      dbGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,
          inviteCode: groups.inviteCode,
          createdBy: groups.createdBy,
          createdAt: groups.createdAt,
        })
        .from(groups)
        .where(inArray(groups.id, uncachedIds));

      // 缓存查询结果
      dbGroups.forEach(group => {
        cache.set(CacheKeys.group(group.id), group, 300000); // 5分钟
      });
    }

    const allGroups = [...cachedGroups, ...dbGroups];

    return NextResponse.json({ groups: allGroups });
  } catch (error) {
    console.error('Batch get groups error:', error);
    return NextResponse.json(
      { error: '批量获取课题组失败' },
      { status: 500 }
    );
  }
}
