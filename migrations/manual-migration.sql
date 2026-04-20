-- 添加邀请码字段到 groups 表
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- 为现有的课题组生成随机邀请码
UPDATE groups
SET invite_code = UPPER(
  SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 6)
)
WHERE invite_code IS NULL;

-- 设置 invite_code 为 NOT NULL 和 UNIQUE
ALTER TABLE groups ALTER COLUMN invite_code SET NOT NULL;
ALTER TABLE groups ADD CONSTRAINT groups_invite_code_unique UNIQUE (invite_code);

-- 创建新的枚举类型（如果不存在）
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 重命名 question_replies 表为 replies（如果存在）
DO $$ BEGIN
  ALTER TABLE IF EXISTS question_replies RENAME TO replies;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

-- 添加 is_anonymous 字段到 replies 表
ALTER TABLE replies ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- 更新 tasks 表结构
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status task_status DEFAULT 'pending';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority task_priority DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- 迁移数据：将 assigned_by 复制到 created_by
UPDATE tasks SET created_by = assigned_by WHERE created_by IS NULL AND assigned_by IS NOT NULL;

-- 设置 created_by 为 NOT NULL
ALTER TABLE tasks ALTER COLUMN created_by SET NOT NULL;

-- 设置 status 和 priority 为 NOT NULL
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN priority SET NOT NULL;

-- 使 assigned_to 可为空
ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;

-- 删除旧字段
ALTER TABLE tasks DROP COLUMN IF EXISTS assigned_by;
ALTER TABLE tasks DROP COLUMN IF EXISTS is_completed;
