-- 增量迁移脚本：添加新字段和修改表结构

-- 1. 添加 invite_code 到 groups 表
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- 为现有课题组生成邀请码
UPDATE groups
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 6))
WHERE invite_code IS NULL;

-- 设置约束
ALTER TABLE groups ALTER COLUMN invite_code SET NOT NULL;
DO $$
BEGIN
  ALTER TABLE groups ADD CONSTRAINT groups_invite_code_unique UNIQUE (invite_code);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. 创建新枚举类型
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. 重命名 question_replies 为 replies
DO $$
BEGIN
  ALTER TABLE question_replies RENAME TO replies;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 4. 添加 is_anonymous 到 replies
ALTER TABLE replies ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- 5. 更新 tasks 表
-- 添加新列
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status task_status DEFAULT 'pending';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority task_priority DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID;

-- 迁移数据
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_by') THEN
    UPDATE tasks SET created_by = assigned_by WHERE created_by IS NULL;
  END IF;
END $$;

-- 添加外键约束
DO $$
BEGIN
  ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 设置 NOT NULL
ALTER TABLE tasks ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN priority SET NOT NULL;

-- 使 assigned_to 可为空
ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;

-- 删除旧列
ALTER TABLE tasks DROP COLUMN IF EXISTS assigned_by;
ALTER TABLE tasks DROP COLUMN IF EXISTS is_completed;

-- 完成
SELECT 'Migration completed successfully!' as status;
