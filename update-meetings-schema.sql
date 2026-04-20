-- Add meeting_status enum if not exists
DO $$ BEGIN
    CREATE TYPE meeting_status AS ENUM ('upcoming', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add end_time column to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP NOT NULL DEFAULT NOW();

-- Add status column to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS status meeting_status NOT NULL DEFAULT 'upcoming';

-- Update existing meetings to have proper end_time (1 hour after scheduled_at)
UPDATE meetings
SET end_time = scheduled_at + INTERVAL '1 hour'
WHERE end_time = scheduled_at OR end_time IS NULL;
