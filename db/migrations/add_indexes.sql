-- =============================================
-- 数据库索引优化脚本
-- 执行方式：在Neon控制台的SQL Editor中执行
-- =============================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 课题组成员索引
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON group_members(user_id, group_id);

-- 会议索引
CREATE INDEX IF NOT EXISTS idx_meetings_group ON meetings(group_id);
CREATE INDEX IF NOT EXISTS idx_meetings_creator ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON meetings(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_group_status ON meetings(group_id, status);

-- 会议笔记索引
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting ON meeting_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_user ON meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_created ON meeting_notes(created_at DESC);

-- 周报索引
CREATE INDEX IF NOT EXISTS idx_reports_user ON weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_group ON weekly_reports(group_id);
CREATE INDEX IF NOT EXISTS idx_reports_submitted ON weekly_reports(is_submitted);
CREATE INDEX IF NOT EXISTS idx_reports_user_submitted ON weekly_reports(user_id, is_submitted);
CREATE INDEX IF NOT EXISTS idx_reports_created ON weekly_reports(created_at DESC);

-- 评论索引
CREATE INDEX IF NOT EXISTS idx_comments_report ON comments(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- 问题索引
CREATE INDEX IF NOT EXISTS idx_questions_group ON questions(group_id);
CREATE INDEX IF NOT EXISTS idx_questions_user ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);

-- 回复索引
CREATE INDEX IF NOT EXISTS idx_replies_question ON replies(question_id);
CREATE INDEX IF NOT EXISTS idx_replies_user ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_created ON replies(created_at DESC);

-- 任务索引
CREATE INDEX IF NOT EXISTS idx_tasks_group ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

-- 通知索引
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- 验证索引创建
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename, indexname;
