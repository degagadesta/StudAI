/**
 * Complete Database Fix Script
 * This script will:
 * 1. Apply all pending migrations
 * 2. Verify all tables exist
 * 3. Report success/failure
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../src/lib/prisma.js';

const execAsync = promisify(exec);

const requiredTables = [
    'Bookmark',
    'StudySession',
    'StudyStreak',
    'StudyGroup',
    'StudyGroupMember',
    'GroupMessage',
    'GroupSharedNote'
];

console.log('\n🔧 StudAI Database Fix Script\n');
console.log('=' .repeat(50));

async function applyMigrations() {
    console.log('\n📦 Step 1: Applying migrations...\n');
    
    try {
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
            cwd: process.cwd(),
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });
        
        if (stdout) console.log(stdout);
        if (stderr && !stderr.includes('Warning')) console.error(stderr);
        
        console.log('✅ Migrations applied successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        if (error.message.includes('P1001') || error.message.includes('Can\'t reach database')) {
            console.error('\n💡 Database connection issue detected:');
            console.error('   - Your database might be sleeping (Neon free tier)');
            console.error('   - Wait a moment and try again');
            console.error('   - Or open your app to wake the database\n');
        }
        
        return false;
    }
}

async function verifyTables() {
    console.log('📋 Step 2: Verifying tables...\n');
    
    const results = [];
    
    for (const table of requiredTables) {
        try {
            const modelName = table.charAt(0).toLowerCase() + table.slice(1);
            
            if (prisma[modelName]) {
                await prisma[modelName].count();
                console.log(`✅ ${table} - OK`);
                results.push({ table, status: 'OK' });
            } else {
                console.log(`⚠️  ${table} - Model not found in Prisma client`);
                results.push({ table, status: 'MISSING_MODEL' });
            }
        } catch (error) {
            if (error.code === 'P2021') {
                console.log(`❌ ${table} - Table does not exist`);
                results.push({ table, status: 'MISSING_TABLE' });
            } else {
                console.log(`⚠️  ${table} - ${error.message}`);
                results.push({ table, status: 'ERROR', error: error.message });
            }
        }
    }
    
    return results;
}

async function main() {
    try {
        // Step 1: Apply migrations
        const migrationsApplied = await applyMigrations();
        
        if (!migrationsApplied) {
            console.log('\n⚠️  Migrations failed, but continuing to verify...\n');
        }
        
        // Step 2: Verify tables
        const results = await verifyTables();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Summary:\n');
        
        const ok = results.filter(r => r.status === 'OK').length;
        const missing = results.filter(r => r.status === 'MISSING_TABLE').length;
        const errors = results.filter(r => r.status === 'ERROR').length;
        
        console.log(`✅ Working: ${ok}/${requiredTables.length}`);
        console.log(`❌ Missing: ${missing}/${requiredTables.length}`);
        if (errors > 0) console.log(`⚠️  Errors: ${errors}/${requiredTables.length}`);
        
        if (ok === requiredTables.length) {
            console.log('\n🎉 SUCCESS! All tables are ready!\n');
            console.log('Next step: Restart your backend server\n');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tables are still missing\n');
            console.log('Troubleshooting:');
            console.log('1. Check DATABASE_URL in .env file');
            console.log('2. Ensure database is accessible');
            console.log('3. Try: npx prisma migrate deploy');
            console.log('4. Then: npx prisma generate\n');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Script failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
