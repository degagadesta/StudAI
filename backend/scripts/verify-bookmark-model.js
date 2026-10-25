/**
 * Verify that Bookmark model is available in Prisma client
 * Run this after regenerating Prisma client to verify everything is working
 */

import { prisma } from '../src/lib/prisma.js';

async function verifyBookmarkModel() {
    console.log('\n🔍 Verifying Bookmark Model Setup...\n');

    // Check if bookmark model exists
    if (typeof prisma.bookmark === 'undefined') {
        console.error('❌ ERROR: prisma.bookmark is undefined');
        console.error('   Run: npx prisma generate');
        process.exit(1);
    }

    console.log('✅ prisma.bookmark exists');

    // Check if we can query the model
    try {
        const count = await prisma.bookmark.count();
        console.log(`✅ Can query bookmarks (found ${count} bookmarks)`);
    } catch (error) {
        console.error('❌ ERROR querying bookmarks:', error.message);
        process.exit(1);
    }

    // Verify the model has the expected methods
    const methods = ['findMany', 'findFirst', 'create', 'update', 'delete', 'count'];
    const missing = methods.filter(method => typeof prisma.bookmark[method] !== 'function');
    
    if (missing.length > 0) {
        console.error(`❌ ERROR: Missing methods: ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log(`✅ All expected methods available: ${methods.join(', ')}`);
    
    console.log('\n✅ Bookmark model is properly configured!\n');
    await prisma.$disconnect();
}

verifyBookmarkModel().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
