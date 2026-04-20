# 性能优化方案

## 一、数据库优化

### 1.1 添加索引

当前数据库缺少关键索引，会导致查询性能下降。

#### 需要添加的索引

```sql
-- 用户相关
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 课题组成员
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user_group ON group_members(user_id, group_id);

-- 会议
CREATE INDEX idx_meetings_group ON meetings(group_id);
CREATE INDEX idx_meetings_creator ON meetings(created_by);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at DESC);
CREATE INDEX idx_meetings_group_status ON meetings(group_id, status);

-- 会议笔记
CREATE INDEX idx_meeting_notes_meeting ON meeting_notes(meeting_id);
CREATE INDEX idx_meeting_notes_user ON meeting_notes(user_id);
CREATE INDEX idx_meeting_notes_created ON meeting_notes(created_at DESC);

-- 周报
CREATE INDEX idx_reports_user ON weekly_reports(user_id);
CREATE INDEX idx_reports_group ON weekly_reports(group_id);
CREATE INDEX idx_reports_submitted ON weekly_reports(is_submitted);
CREATE INDEX idx_reports_user_submitted ON weekly_reports(user_id, is_submitted);
CREATE INDEX idx_reports_created ON weekly_reports(created_at DESC);

-- 评论
CREATE INDEX idx_comments_report ON comments(report_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- 问题
CREATE INDEX idx_questions_group ON questions(group_id);
CREATE INDEX idx_questions_user ON questions(user_id);
CREATE INDEX idx_questions_created ON questions(created_at DESC);

-- 回复
CREATE INDEX idx_replies_question ON replies(question_id);
CREATE INDEX idx_replies_user ON replies(user_id);
CREATE INDEX idx_replies_created ON replies(created_at DESC);

-- 任务
CREATE INDEX idx_tasks_group ON tasks(group_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_creator ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);

-- 通知
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
```

#### 执行方式

**方式1：在Neon控制台执行**
1. 登录 https://console.neon.tech/
2. 选择项目和数据库
3. 进入SQL Editor
4. 复制粘贴上述SQL并执行

**方式2：使用Drizzle ORM**
创建迁移文件后执行 `npx drizzle-kit push`

---

### 1.2 查询优化

#### 问题1：N+1查询问题

**当前问题：**
```typescript
// 会议列表页面
meetings.forEach(meeting => {
  fetch(`/api/groups/${meeting.groupId}`); // N次查询
  fetch(`/api/users/${meeting.createdBy}`); // N次查询
});
```

**优化方案：**
```typescript
// 一次性获取所有需要的数据
const groupIds = [...new Set(meetings.map(m => m.groupId))];
const userIds = [...new Set(meetings.map(m => m.createdBy))];

// 批量查询API
const groups = await fetch(`/api/groups/batch?ids=${groupIds.join(',')}`);
const users = await fetch(`/api/users/batch?ids=${userIds.join(',')}`);
```

#### 问题2：缺少分页

**当前问题：**
```typescript
// 一次性加载所有数据
const meetings = await db.select().from(meetings);
```

**优化方案：**
```typescript
// 分页查询
const page = 1;
const pageSize = 20;
const meetings = await db
  .select()
  .from(meetings)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

---

## 二、前端性能优化

### 2.1 组件优化

#### 使用React.memo避免不必要的重渲染

```typescript
// components/meetings/MeetingCard.tsx
import React, { memo } from 'react';

export const MeetingCard = memo(({ meeting, group }) => {
  // 组件内容
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.meeting.id === nextProps.meeting.id &&
         prevProps.meeting.updatedAt === nextProps.meeting.updatedAt;
});
```

#### 使用useMemo缓存计算结果

```typescript
// 当前问题：每次渲染都重新计算
const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
const inProgressMeetings = meetings.filter(m => m.status === 'in_progress');

// 优化方案
const upcomingMeetings = useMemo(
  () => meetings.filter(m => m.status === 'upcoming'),
  [meetings]
);
const inProgressMeetings = useMemo(
  () => meetings.filter(m => m.status === 'in_progress'),
  [meetings]
);
```

#### 使用useCallback缓存函数

```typescript
// 当前问题：每次渲染创建新函数
const handleClick = () => { /* ... */ };

// 优化方案
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies]);
```

---

### 2.2 数据加载优化

#### 实现骨架屏

```typescript
// components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

// 使用示例
{isLoading ? (
  <Skeleton className="h-32 w-full" />
) : (
  <MeetingCard meeting={meeting} />
)}
```

#### 虚拟滚动（长列表优化）

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={meetings.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MeetingCard meeting={meetings[index]} />
    </div>
  )}
</FixedSizeList>
```

#### 图片懒加载

```typescript
// 使用Next.js Image组件
import Image from 'next/image';

<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  loading="lazy"
/>
```

---

### 2.3 状态管理优化

#### Zustand选择器优化

```typescript
// 当前问题：订阅整个store
const { meetings, reports, users } = useMeetingsStore();

// 优化方案：只订阅需要的数据
const meetings = useMeetingsStore(state => state.meetings);
const fetchMeetings = useMeetingsStore(state => state.fetchMeetings);
```

#### 避免频繁的状态更新

```typescript
// 当前问题：轮询导致频繁更新
setInterval(() => {
  fetchNotes(); // 每5秒更新一次
}, 5000);

// 优化方案：只在数据变化时更新
const checkForUpdates = async () => {
  const response = await fetch(`/api/meetings/${id}/notes/check`);
  const { hasUpdates, lastUpdateTime } = await response.json();
  
  if (hasUpdates) {
    fetchNotes();
  }
};
```

---

## 三、API性能优化

### 3.1 实现API响应缓存

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1分钟

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// 使用示例
export async function GET(request: NextRequest) {
  const cacheKey = `groups_${groupId}`;
  const cached = getCached(cacheKey);
  
  if (cached) {
    return NextResponse.json(cached);
  }
  
  const data = await db.select().from(groups);
  setCache(cacheKey, data);
  
  return NextResponse.json(data);
}
```

### 3.2 批量查询API

```typescript
// app/api/users/batch/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',') || [];
  
  if (ids.length === 0) {
    return NextResponse.json({ users: [] });
  }
  
  const users = await db
    .select()
    .from(users)
    .where(inArray(users.id, ids));
  
  return NextResponse.json({ users });
}
```

### 3.3 数据库连接池

```typescript
// db/drizzle.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    cache: 'no-store',
  },
  // 连接池配置
  poolQueryViaFetch: true,
});

export const db = drizzle(sql);
```

---

## 四、Next.js优化

### 4.1 启用静态生成（ISR）

```typescript
// app/dashboard/page.tsx
export const revalidate = 60; // 60秒重新验证

export default async function DashboardPage() {
  // 页面内容
}
```

### 4.2 优化Bundle大小

```typescript
// next.config.ts
const nextConfig = {
  // 启用SWC压缩
  swcMinify: true,
  
  // 分析bundle大小
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    return config;
  },
};
```

### 4.3 使用动态导入

```typescript
// 当前问题：一次性加载所有组件
import { MeetingEditor } from '@/components/meetings/MeetingEditor';

// 优化方案：按需加载
const MeetingEditor = dynamic(
  () => import('@/components/meetings/MeetingEditor'),
  { loading: () => <Skeleton /> }
);
```

---

## 五、监控和分析

### 5.1 性能监控

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
}

// 使用示例
measurePerformance('Fetch meetings', async () => {
  await fetchMeetings();
});
```

### 5.2 使用Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 六、优化优先级

### 立即实施（高优先级）
1. ✅ **添加数据库索引** - 最大性能提升
2. ✅ **实现分页加载** - 减少初始加载时间
3. ✅ **修复N+1查询** - 减少API调用次数
4. ✅ **使用React.memo** - 避免不必要的重渲染

### 短期实施（中优先级）
5. **实现骨架屏** - 提升用户体验
6. **API响应缓存** - 减少数据库查询
7. **图片懒加载** - 减少初始加载
8. **批量查询API** - 优化数据获取

### 长期实施（低优先级）
9. **虚拟滚动** - 优化长列表
10. **动态导入** - 减少bundle大小
11. **ISR静态生成** - 提升页面加载速度
12. **性能监控** - 持续优化

---

## 七、预期性能提升

| 优化项 | 当前 | 优化后 | 提升 |
|--------|------|--------|------|
| 首页加载时间 | 2-3秒 | 0.5-1秒 | 60-70% |
| 会议列表查询 | 500-800ms | 50-100ms | 80-90% |
| API响应时间 | 200-400ms | 50-100ms | 70-80% |
| 内存占用 | 150-200MB | 80-120MB | 40-50% |

---

## 八、性能测试工具

1. **Chrome DevTools**
   - Performance面板
   - Network面板
   - Lighthouse

2. **React DevTools Profiler**
   - 组件渲染性能分析

3. **数据库查询分析**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM meetings WHERE group_id = 'xxx';
   ```

4. **Bundle分析**
   ```bash
   npm install @next/bundle-analyzer
   ```
