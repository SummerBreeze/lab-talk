# 通知系统使用说明

## 问题修复

### 1. 周报提交通知
**问题：** 学生提交周报后，教师没有收到通知

**解决方案：**
- ✅ 修改 `app/api/reports/[id]/submit/route.ts`
- ✅ 提交周报时自动通知课题组所有教师
- ✅ 通知内容："{学生姓名}提交了周报"{周报标题}""

### 2. 周报列表实时更新
**问题：** 教师端看不到学生刚提交的周报

**解决方案：**
- ✅ 修改 `stores/reportsStore.ts` 添加自动刷新功能
- ✅ 教师端每10秒自动刷新周报列表
- ✅ 学生端不自动刷新（避免不必要的请求）

---

## 通知场景总结

### 已实现的通知
1. ✅ **周报评论** - 有人评论你的周报时通知
2. ✅ **周报提交** - 学生提交周报时通知所有教师

### 可以添加的通知场景

#### 会议相关
```typescript
// 会议创建 - 通知课题组所有成员
await createNotifications(
  members.map(m => ({
    userId: m.userId,
    ...NotificationTemplates.meetingCreated(title, meetingId),
  }))
);

// 会议即将开始 - 提前15分钟提醒
await createNotifications(
  participants.map(p => ({
    userId: p.userId,
    ...NotificationTemplates.meetingStarting(title, meetingId),
  }))
);
```

#### 任务相关
```typescript
// 任务分配
await createNotification({
  userId: assignedUserId,
  ...NotificationTemplates.taskAssigned(taskTitle, taskId),
});
```

#### 问答相关
```typescript
// 问题被回复
await createNotification({
  userId: questionAuthorId,
  type: 'mention',
  title: '你的问题有新回复',
  content: `${replierName}回复了你的问题"${questionTitle}"`,
  link: `/qa/${questionId}`,
});
```

---

## 自动刷新机制

### 教师端
- **周报列表页** (`/reports`) - 每10秒自动刷新
- **课题组周报页** (`/groups/[id]/reports`) - 每10秒自动刷新
- **目的：** 实时看到学生提交的新周报

### 学生端
- 不自动刷新，手动刷新页面即可
- **原因：** 学生主要查看自己的周报，不需要实时更新

### 防抖机制
- 5秒内不会重复请求同一个API
- 避免频繁刷新造成服务器压力

---

## 测试步骤

### 测试周报提交通知

1. **准备两个账号**
   - 账号A：学生
   - 账号B：教师（同一课题组）

2. **测试流程**
   ```
   1. 账号B（教师）登录，进入周报页面
   2. 账号A（学生）登录，创建并提交周报
   3. 账号B应该：
      - 右上角铃铛显示红点（未读通知）
      - 点击铃铛看到通知："XXX提交了周报"
      - 10秒内周报列表自动刷新，显示新周报
   ```

3. **验证点**
   - ✅ 通知实时推送（SSE）
   - ✅ 未读数量正确
   - ✅ 点击通知跳转到周报详情
   - ✅ 周报列表自动更新

### 测试周报评论通知

1. **测试流程**
   ```
   1. 账号A（学生）提交周报
   2. 账号B（教师）评论周报
   3. 账号A应该收到通知："XXX评论了你的周报"
   ```

---

## 通知类型说明

| 类型 | 图标 | 说明 | 已实现 |
|------|------|------|--------|
| meeting | 📅 | 会议相关通知 | ❌ |
| comment | 💬 | 评论通知 | ✅ |
| task | ✅ | 任务分配 | ❌ |
| report | 📝 | 周报提交 | ✅ |
| mention | @ | @提及 | ❌ |
| system | 🔔 | 系统通知 | ❌ |

---

## 性能优化

### 1. 防止重复请求
```typescript
// 5秒内不会重复请求
if (!force && now - lastFetchTime < 5000) {
  return;
}
```

### 2. 自动刷新间隔
- 当前：10秒
- 可调整：`startAutoRefresh(groupId, 15000)` // 15秒

### 3. 页面离开时停止刷新
```typescript
useEffect(() => {
  startAutoRefresh();
  
  return () => {
    stopAutoRefresh(); // 清理定时器
  };
}, []);
```

---

## 常见问题

### Q1: 通知没有实时显示？
**A:** 检查以下几点：
1. 浏览器控制台是否有SSE连接错误
2. 确认用户已登录
3. 检查 `/api/notifications/stream` 是否正常

### Q2: 周报列表不更新？
**A:** 
1. 确认是教师账号（学生端不自动刷新）
2. 检查浏览器控制台是否有错误
3. 手动刷新页面

### Q3: 收到重复通知？
**A:** 
1. 检查是否有多个浏览器标签页打开
2. 每个标签页都会建立SSE连接

### Q4: 如何调整刷新频率？
**A:** 
修改 `startAutoRefresh` 的第二个参数：
```typescript
startAutoRefresh(groupId, 15000); // 15秒
```

---

## 下一步扩展

### 建议添加的功能
1. **会议提醒** - 会议开始前15分钟通知
2. **任务到期提醒** - 任务截止前1天通知
3. **@提及功能** - 评论中@某人时通知
4. **邮件通知** - 重要通知同时发送邮件
5. **通知设置** - 用户自定义接收哪些类型的通知

### 性能优化建议
1. **Redis缓存** - 生产环境使用Redis替代内存缓存
2. **WebSocket** - 高并发场景使用WebSocket替代SSE
3. **消息队列** - 使用队列处理批量通知发送

---

## 技术细节

### SSE连接
- 端点：`/api/notifications/stream`
- 轮询间隔：5秒
- 自动重连：断开5秒后重连

### 通知存储
- 数据库表：`notifications`
- 索引：`user_id`, `is_read`, `created_at`
- 保留时间：建议30天

### 浏览器通知
- 首次使用请求权限
- 需要HTTPS（本地开发除外）
- 支持点击跳转
