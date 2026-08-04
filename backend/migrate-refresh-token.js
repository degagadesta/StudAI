import pg from 'pg';
import 'dotenv/config';

const client = new pg.Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        // Check if columns exist
        const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Student' 
      AND column_name IN ('refreshToken', 'refreshTokenExpiresAt')
    `);

        if (checkColumns.rows.length === 2) {
            console.log('Refresh token columns already exist!');
            return;
        }

        console.log('Adding refresh token columns...');

        // Add columns
        await client.query(`
      ALTER TABLE "Student" 
      ADD COLUMN IF NOT EXISTS "refreshToken" TEXT,
      ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3)
    `);

        console.log('Creating unique index...');

        // Create unique index
        await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Student_refreshToken_key" 
      ON "Student"("refreshToken")
    `);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

migrate();
