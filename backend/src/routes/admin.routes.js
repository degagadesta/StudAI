import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { exec } from "child_process";
import { promisify } from "util";

const router = Router();
const execAsync = promisify(exec);

/**
 * Apply database migrations
 * GET /api/v1/admin/migrate
 */
router.get("/migrate", async (req, res) => {
    try {
        console.log("[Admin] Running migrations...");
        
        const { stdout, stderr } = await execAsync("npx prisma migrate deploy", {
            cwd: process.cwd(),
            maxBuffer: 1024 * 1024 * 10,
        });
        
        console.log("[Admin] Migration output:", stdout);
        if (stderr) console.error("[Admin] Migration stderr:", stderr);
        
        res.json({
            success: true,
            message: "Migrations applied successfully",
            output: stdout,
        });
    } catch (error) {
        console.error("[Admin] Migration error:", error);
        res.status(500).json({
            success: false,
            message: "Migration failed",
            error: error.message,
        });
    }
});

/**
 * Verify database tables
 * GET /api/v1/admin/verify-tables
 */
router.get("/verify-tables", async (req, res) => {
    const tables = [
        "bookmark",
        "studySession",
        "studyStreak",
        "studyGroup",
        "studyGroupMember",
        "groupMessage",
        "groupSharedNote",
    ];
    
    const results = [];
    
    for (const table of tables) {
        try {
            if (prisma[table]) {
                await prisma[table].count();
                results.push({ table, status: "OK" });
            } else {
                results.push({ table, status: "MODEL_NOT_FOUND" });
            }
        } catch (error) {
            results.push({
                table,
                status: "ERROR",
                error: error.message,
                code: error.code,
            });
        }
    }
    
    const ok = results.filter((r) => r.status === "OK").length;
    const total = tables.length;
    
    res.json({
        success: ok === total,
        tables: results,
        summary: {
            working: ok,
            total,
            percentage: Math.round((ok / total) * 100),
        },
    });
});

/**
 * Create missing tables directly via SQL
 * POST /api/v1/admin/create-tables
 */
router.post("/create-tables", async (req, res) => {
    try {
        console.log("[Admin] Creating missing tables...");
        
        // Bookmark table
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
                "updatedAt" TIMESTAMP(3) NOT NULL,
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
        
        // Study Session & Streak enums
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
        
        // StudySession table
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
        
        // StudyStreak table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudyStreak" (
                "id" TEXT NOT NULL,
                "studentId" TEXT NOT NULL,
                "currentStreak" INTEGER NOT NULL DEFAULT 0,
                "longestStreak" INTEGER NOT NULL DEFAULT 0,
                "lastStudyDate" TIMESTAMP(3),
                "totalMinutes" INTEGER NOT NULL DEFAULT 0,
                "totalSessions" INTEGER NOT NULL DEFAULT 0,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "StudyStreak_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StudyStreak_studentId_key" 
            ON "StudyStreak"("studentId");
        `);
        
        // StudyGroup enums
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
        
        // StudyGroup table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StudyGroup" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "subject" TEXT,
                "curriculumCourseId" TEXT,
                "inviteCode" TEXT NOT NULL,
                "createdById" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "StudyGroup_pkey" PRIMARY KEY ("id")
            );
        `);
        
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StudyGroup_inviteCode_key" 
            ON "StudyGroup"("inviteCode");
        `);
        
        // StudyGroupMember table
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
            CREATE UNIQUE INDEX IF NOT EXISTS "StudyGroupMember_studyGroupId_studentId_key" 
            ON "StudyGroupMember"("studyGroupId", "studentId");
        `);
        
        // GroupMessage table
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
        
        // GroupSharedNote table
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
        
        console.log("[Admin] Tables created successfully");
        
        res.json({
            success: true,
            message: "All missing tables created successfully",
        });
    } catch (error) {
        console.error("[Admin] Error creating tables:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create tables",
            error: error.message,
        });
    }
});

export default router;
