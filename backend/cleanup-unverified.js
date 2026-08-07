import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function cleanupUnverifiedAccounts() {
  try {
    console.log('🧹 Cleaning up unverified accounts...');
    
    // Find all unverified students
    const unverified = await prisma.student.findMany({
      where: {
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        createdAt: true,
      },
    });

    console.log(`\nFound ${unverified.length} unverified accounts:`);
    unverified.forEach((student) => {
      console.log(`  - ${student.email} (${student.firstName}) - created ${student.createdAt.toLocaleString()}`);
    });

    if (unverified.length === 0) {
      console.log('\n✅ No unverified accounts to clean up!');
      return;
    }

    // Delete all unverified students
    const result = await prisma.student.deleteMany({
      where: {
        emailVerified: false,
      },
    });

    console.log(`\n✅ Successfully deleted ${result.count} unverified accounts!`);
    console.log('These accounts can now be re-registered with proper email verification.');
  } catch (error) {
    console.error('❌ Error cleaning up unverified accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUnverifiedAccounts();
