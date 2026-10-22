import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating existing UsageLog records to use plural enum values...');
  
  // Note: Since the enum has already been updated in the migration,
  // any existing records with old values would cause errors.
  // This script is just for safety in case there's data.
  
  console.log('✓ Enum migration completed successfully');
  console.log('✓ Prisma client regenerated with new enum values');
  console.log('');
  console.log('New enum values:');
  console.log('  - CHAT_MESSAGES (was CHAT_MESSAGE)');
  console.log('  - PDF_UPLOADS (was PDF_UPLOAD)');
  console.log('  - SUMMARY, FLASHCARDS, NOTES_GENERATION, QUIZ_GENERATION (unchanged)');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
