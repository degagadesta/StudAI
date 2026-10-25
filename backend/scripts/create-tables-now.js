/**
 * EMERGENCY TABLE CREATOR
 * This script connects to your database and creates all missing tables
 * Run this while your backend is running to fix all errors
 */

import { prisma } from '../src/lib/prisma.js';

console.log('\n🚨 EMERGENCY TABLE CREATOR\n');
console.log('Creating all missing tables...\n');

async function createTables() {
    try {
        // Create Enums first
        console.log('📦 Creating enums...');
        
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "SessionType" AS ENUM ('REGULAR', 'POMODORO', 'TIMED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "GroupMemberRole" AS ENUM ('ADMIN', 'MEMBER');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await prisma.$executeRawUnsafe(`
            DO $$ BEGIN
                CREATE TYPE "MessageType" AS ENUM ('TEXT', 'NOTE_SHARE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        console.log('✅ Enums created\n');
        
        // Create Bookmark table
        console.log('📦 Creating Bookmark table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Bookmark" (
                "id" TEXT NOT NULL,
                "studentId" TEXT NOT NULL,
                "materialId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "pageNumber" INTEGER NOT NULL,
                "textSelection" JSONB,
                "color" TEXT DEFAULT 'yellow',
                "note" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "Bookmark_studentId_materialId_idx" 
            ON "Bookmark"("studentId", "materialId");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "Bookmark_materialId_idx" 
            ON "Bookmark"("materialId");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Bookmark" DROP CONSTRAINT IF EXISTS "Bookmark_materialId_fkey";
            ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_materialId_fkey" 
            FOREIGN KEY ("materialId") REFERENCES "CourseMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Bookmark" DROP CONSTRAINT IF EXISTS "Bookmark_studentId_fkey";
            ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_studentId_fkey" 
            FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ Bookmark table created\n');
        
        // Create StudySession table
        console.log('📦 Creating StudySession table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudySession" (
                "id" TEXT NOT NULL,
                "studentId" TEXT NOT NULL,
                "courseId" TEXT,
                "materialId" TEXT,
                "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "endTime" TIMESTAMP(3),
                "duration" INTEGER NOT NULL DEFAULT 0,
                "type" "SessionType" NOT NULL DEFAULT 'REGULAR',
                "pomodoroCount" INTEGER NOT NULL DEFAULT 0,
                "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudySession_studentId_status_idx" 
            ON "StudySession"("studentId", "status");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudySession_studentId_startTime_idx" 
            ON "StudySession"("studentId", "startTime");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudySession_startTime_idx" 
            ON "StudySession"("startTime");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "StudySession" DROP CONSTRAINT IF EXISTS "StudySession_studentId_fkey";
            ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_studentId_fkey" 
            FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ StudySession table created\n');
        
        // Create StudyStreak table
        console.log('📦 Creating StudyStreak table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudyStreak" (
                "id" TEXT NOT NULL,
                "studentId" TEXT NOT NULL,
                "currentStreak" INTEGER NOT NULL DEFAULT 0,
                "longestStreak" INTEGER NOT NULL DEFAULT 0,
                "lastStudyDate" TIMESTAMP(3),
                "totalMinutes" INTEGER NOT NULL DEFAULT 0,
                "totalSessions" INTEGER NOT NULL DEFAULT 0,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "StudyStreak_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StudyStreak_studentId_key" 
            ON "StudyStreak"("studentId");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "StudyStreak" DROP CONSTRAINT IF EXISTS "StudyStreak_studentId_fkey";
            ALTER TABLE "StudyStreak" ADD CONSTRAINT "StudyStreak_studentId_fkey" 
            FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ StudyStreak table created\n');
        
        // Create StudyGroup table
        console.log('📦 Creating StudyGroup table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudyGroup" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "subject" TEXT,
                "curriculumCourseId" TEXT,
                "inviteCode" TEXT NOT NULL,
                "createdById" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "StudyGroup_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StudyGroup_inviteCode_key" 
            ON "StudyGroup"("inviteCode");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudyGroup_inviteCode_idx" 
            ON "StudyGroup"("inviteCode");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudyGroup_createdById_idx" 
            ON "StudyGroup"("createdById");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "StudyGroup" DROP CONSTRAINT IF EXISTS "StudyGroup_createdById_fkey";
            ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_createdById_fkey" 
            FOREIGN KEY ("createdById") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ StudyGroup table created\n');
        
        // Create StudyGroupMember table
        console.log('📦 Creating StudyGroupMember table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudyGroupMember" (
                "id" TEXT NOT NULL,
                "studyGroupId" TEXT NOT NULL,
                "studentId" TEXT NOT NULL,
                "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
                "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "StudyGroupMember_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudyGroupMember_studentId_idx" 
            ON "StudyGroupMember"("studentId");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "StudyGroupMember_studyGroupId_idx" 
            ON "StudyGroupMember"("studyGroupId");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StudyGroupMember_studyGroupId_studentId_key" 
            ON "StudyGroupMember"("studyGroupId", "studentId");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "StudyGroupMember" DROP CONSTRAINT IF EXISTS "StudyGroupMember_studyGroupId_fkey";
            ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_studyGroupId_fkey" 
            FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "StudyGroupMember" DROP CONSTRAINT IF EXISTS "StudyGroupMember_studentId_fkey";
            ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_studentId_fkey" 
            FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ StudyGroupMember table created\n');
        
        // Create GroupMessage table
        console.log('📦 Creating GroupMessage table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "GroupMessage" (
                "id" TEXT NOT NULL,
                "studyGroupId" TEXT NOT NULL,
                "senderId" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "type" "MessageType" NOT NULL DEFAULT 'TEXT',
                "sharedResourceId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "GroupMessage_studyGroupId_createdAt_idx" 
            ON "GroupMessage"("studyGroupId", "createdAt");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "GroupMessage_senderId_idx" 
            ON "GroupMessage"("senderId");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "GroupMessage" DROP CONSTRAINT IF EXISTS "GroupMessage_studyGroupId_fkey";
            ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_studyGroupId_fkey" 
            FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "GroupMessage" DROP CONSTRAINT IF EXISTS "GroupMessage_senderId_fkey";
            ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_senderId_fkey" 
            FOREIGN KEY ("senderId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ GroupMessage table created\n');
        
        // Create GroupSharedNote table
        console.log('📦 Creating GroupSharedNote table...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "GroupSharedNote" (
                "id" TEXT NOT NULL,
                "studyGroupId" TEXT NOT NULL,
                "noteId" TEXT NOT NULL,
                "sharedById" TEXT NOT NULL,
                "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "GroupSharedNote_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "GroupSharedNote_studyGroupId_idx" 
            ON "GroupSharedNote"("studyGroupId");
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "GroupSharedNote_noteId_idx" 
            ON "GroupSharedNote"("noteId");
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "GroupSharedNote" DROP CONSTRAINT IF EXISTS "GroupSharedNote_studyGroupId_fkey";
            ALTER TABLE "GroupSharedNote" ADD CONSTRAINT "GroupSharedNote_studyGroupId_fkey" 
            FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "GroupSharedNote" DROP CONSTRAINT IF EXISTS "GroupSharedNote_noteId_fkey";
            ALTER TABLE "GroupSharedNote" ADD CONSTRAINT "GroupSharedNote_noteId_fkey" 
            FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "GroupSharedNote" DROP CONSTRAINT IF EXISTS "GroupSharedNote_sharedById_fkey";
            ALTER TABLE "GroupSharedNote" ADD CONSTRAINT "GroupSharedNote_sharedById_fkey" 
            FOREIGN KEY ("sharedById") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        
        console.log('✅ GroupSharedNote table created\n');
        
        console.log('=' .repeat(50));
        console.log('🎉 SUCCESS! All tables created!\n');
        console.log('Next step: Restart your backend server\n');
        console.log('Press Ctrl+C in backend terminal and run: npm run dev\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createTables();
