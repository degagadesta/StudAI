-- CreateEnum for SessionType
DO $$ BEGIN
    CREATE TYPE "SessionType" AS ENUM ('REGULAR', 'POMODORO', 'TIMED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for SessionStatus
DO $$ BEGIN
    CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable StudySession
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

-- CreateTable StudyStreak
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudySession_studentId_status_idx" ON "StudySession"("studentId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudySession_studentId_startTime_idx" ON "StudySession"("studentId", "startTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudySession_startTime_idx" ON "StudySession"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StudyStreak_studentId_key" ON "StudyStreak"("studentId");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyStreak" ADD CONSTRAINT "StudyStreak_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
