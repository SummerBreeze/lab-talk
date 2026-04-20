import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function addInviteCode() {
  try {
    console.log('Adding invite_code to existing groups...');

    // 为现有课题组生成随机邀请码
    const result = await sql`
      UPDATE groups
      SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 6))
      WHERE invite_code IS NULL
      RETURNING id, name, invite_code;
    `;

    console.log('✓ Updated groups:', result);
    console.log('\n✅ Done! Now you can run: npx drizzle-kit push');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addInviteCode();
