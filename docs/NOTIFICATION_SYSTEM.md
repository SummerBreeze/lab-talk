# 实时通知系统实现文档

## 一、技术方案：Server-Sent Events (SSE)

### 为什么选择SSE？
- ✅ Next.js原生支持，无需额外服务器
- ✅ 单向推送，适合通知场景
- ✅ 自动重连机制
- ✅ 实现简单，维护成本低
- ✅ 浏览器兼容性好

### 架构流程
```
用户操作 → 触发通知创建 → 写入数据库 → SSE推送 → 前端更新UI
```

---

## 二、已实现的功能

### 1. 数据库Schema扩展
- ✅ 扩展通知类型：meeting, comment, task, material, report, mention, system
- ✅ notifications表已存在，包含：userId, type, title, content, link, isRead, createdAt

### 2. API端点
- ✅ `GET /api/notifications` - 获取通知列表
- ✅ `POST /api/notifications/mark-read` - 标记已读
- ✅ `GET /api/notifications/stream` - SSE实时推送

### 3. 通知工具库
- ✅ `lib/notifications.ts` - 创建通知的辅助函数
- ✅ 通知模板：会议、评论、任务、周报等

### 4. 前端状态管理
- ✅ `stores/notificationsStore.ts` - Zustand状态管理
- ✅ SSE连接管理、自动重连
- ✅ 浏览器通知集成

### 5. UI组件
- ✅ `components/notifications/NotificationBell.tsx` - 通知铃铛组件
- ✅ 未读数量显示
- ✅ 下拉通知列表
- ✅ 点击跳转、标记已读

### 6. 集成示例
- ✅ Header组件已集成NotificationBell
- ✅ 周报评论自动发送通知

---

## 三、使用方法

### 在API中创建通知

```typescript
import { createNotification, NotificationTemplates } from '@/lib/notifications';

// 示例1：会议创建通知
await createNotification({
  userId: targetUserId,
  ...NotificationTemplates.meetingCreated('每周例会', meetingId),
});

// 示例2：任务分配通知
await createNotification({
  userId: assignedUserId,
  ...NotificationTemplates.taskAssigned('完成项目文档', taskId),
});

// 示例3：自定义通知
await createNotification({
  userId: userId,
  type: 'system',
  title: '系统维护通知',
  content: '系统将于今晚22:00进行维护',
  link: '/dashboard',
});
```

### 批量创建通知

```typescript
import { createNotifications } from '@/lib/notifications';

// 给课题组所有成员发送通知
const members = await getGroupMembers(groupId);
await createNotifications(
  members.map(member => ({
    userId: member.userId,
    ...NotificationTemplates.meetingCreated('组会', meetingId),
  }))
);
```

---

## 四、需要集成通知的场景

### 高优先级
1. ✅ **周报评论** - 已实现
2. **会议创建** - 通知所有课题组成员
3. **会议即将开始** - 提前15分钟提醒
4. **任务分配** - 通知被分配人
5. **周报提交** - 通知教师

### 中优先级
6. **问答回复** - 通知提问者
7. **会议笔记添加** - 通知参会人员
8. **任务状态变更** - 通知创建者
9. **课题组邀请** - 通知被邀请人

---

## 五、数据库迁移

需要执行SQL更新通知类型枚举：

```sql
-- 在Neon控制台执行
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'report';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'mention';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'system';
```

或者使用Drizzle Kit：
```bash
npx drizzle-kit push
```

---

## 六、测试步骤

1. 启动开发服务器：`npm run dev`
2. 登录两个不同账号（两个浏览器）
3. 账号A提交周报
4. 账号B（教师）评论周报
5. 账号A应该实时收到通知（右上角铃铛显示红点）
6. 点击通知查看详情

---

## 七、浏览器通知权限

首次使用时会请求浏览器通知权限，用户允许后：
- 新通知会显示系统级通知
- 即使页面在后台也能收到提醒

---

## 八、性能优化建议

1. **SSE轮询间隔**：当前5秒，可根据需求调整
2. **通知数量限制**：前端只显示最近20条
3. **数据库索引**：
```sql
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

4. **定期清理**：建议定期删除30天前的已读通知

---

## 九、扩展功能

### 可选增强
1. **通知分组**：按类型分组显示
2. **全部标记已读**：一键清空未读
3. **通知设置**：用户自定义接收哪些类型
4. **邮件通知**：重要通知同时发送邮件
5. **通知统计**：分析用户活跃度

---

## 十、故障排查

### SSE连接失败
- 检查浏览器控制台是否有错误
- 确认用户已登录（Session有效）
- 检查网络连接

### 通知不显示
- 检查数据库中是否有通知记录
- 确认userId正确
- 查看浏览器控制台SSE消息

### 自动重连
- SSE断开后会在5秒后自动重连
- 页面刷新会重新建立连接
