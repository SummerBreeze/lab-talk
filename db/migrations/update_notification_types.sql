-- 更新通知类型枚举，添加 report, mention, system
-- 在Neon控制台的SQL Editor中执行

-- 方法1：如果数据库中notifications表还没有数据，可以直接删除重建
-- DROP TYPE IF EXISTS notification_type CASCADE;
-- CREATE TYPE notification_type AS ENUM ('meeting', 'comment', 'task', 'material', 'report', 'mention', 'system');

-- 方法2：如果已有数据，使用ALTER TYPE添加新值
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'report';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'mention';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'system';

-- 验证枚举值
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'notification_type'::regtype
ORDER BY enumsortorder;
