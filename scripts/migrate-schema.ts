import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Starting schema migration...');

    // Add new enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✓ Created task_status enum');

    await sql`
      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✓ Created task_priority enum');

    // Rename question_replies table to replies
    await sql`
      ALTER TABLE IF EXISTS question_replies RENAME TO replies;
    `;
    console.log('✓ Renamed question_replies to replies');

    // Add isAnonymous to replies table
    await sql`
      ALTER TABLE replies
      ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;
    `;
    console.log('✓ Added is_anonymous to replies');

    // Update tasks table
    await sql`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS status task_status NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS priority task_priority NOT NULL DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
    `;
    console.log('✓ Added status, priority, created_by to tasks');

    // Migrate data from assigned_by to created_by
    await sql`
      UPDATE tasks SET created_by = assigned_by WHERE created_by IS NULL;
    `;
    console.log('✓ Migrated assigned_by to created_by');

    // Make created_by NOT NULL
    await sql`
      ALTER TABLE tasks ALTER COLUMN created_by SET NOT NULL;
    `;
    console.log('✓ Set created_by as NOT NULL');

    // Make assigned_to nullable
    await sql`
      ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;
    `;
    console.log('✓ Made assigned_to nullable');

    // Drop old columns
    await sql`
      ALTER TABLE tasks
      DROP COLUMN IF EXISTS assigned_by,
      DROP COLUMN IF EXISTS is_completed;
    `;
    console.log('✓ Dropped old columns from tasks');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
