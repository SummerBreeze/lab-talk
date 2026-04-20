-- Add summary column to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS summary TEXT;
