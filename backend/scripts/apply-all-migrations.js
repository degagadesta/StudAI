/**
 * Apply all pending migrations to the database
 * This script uses the Prisma Migrate API to deploy all migrations
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = join(__dirname, '..');

console.log('\n🔧 Applying Database Migrations...\n');
console.log('This will create all missing tables in your database.\n');

const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true
});

migrate.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ All migrations applied successfully!\n');
        console.log('📝 Next step: Restart your backend server\n');
        process.exit(0);
    } else {
        console.error('\n❌ Migration failed with code', code);
        console.error('\nTroubleshooting:');
        console.error('1. Check your DATABASE_URL in .env');
        console.error('2. Ensure database is accessible');
        console.error('3. Try running manually: npx prisma migrate deploy\n');
        process.exit(1);
    }
});

migrate.on('error', (error) => {
    console.error('\n❌ Failed to run migration:', error.message);
    process.exit(1);
});
