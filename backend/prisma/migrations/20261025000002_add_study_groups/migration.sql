-- CreateEnum for GroupMemberRole
DO $$ BEGIN
    CREATE TYPE "GroupMemberRole" AS ENUM ('ADMIN', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for MessageType
DO $$ BEGIN
    CREATE TYPE "MessageType" AS ENUM ('TEXT', 'NOTE_SHARE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable StudyGroup
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

-- CreateTable StudyGroupMember
CREATE TABLE IF NOT EXISTS "StudyGroupMember" (
    "id" TEXT NOT NULL,
    "studyGroupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable GroupMessage
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

-- CreateTable GroupSharedNote
CREATE TABLE IF NOT EXISTS "GroupSharedNote" (
    "id" TEXT NOT NULL,
    "studyGroupId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupSharedNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StudyGroup_inviteCode_key" ON "StudyGroup"("inviteCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudyGroup_inviteCode_idx" ON "StudyGroup"("inviteCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudyGroup_createdById_idx" ON "StudyGroup"("createdById");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudyGroupMember_studentId_idx" ON "StudyGroupMember"("studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudyGroupMember_studyGroupId_idx" ON "StudyGroupMember"("studyGroupId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StudyGroupMember_studyGroupId_studentId_key" ON "StudyGroupMember"("studyGroupId", "studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GroupMessage_studyGroupId_createdAt_idx" ON "GroupMessage"("studyGroupId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GroupMessage_senderId_idx" ON "GroupMessage"("senderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GroupSharedNote_studyGroupId_idx" ON "GroupSharedNote"("studyGroupId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GroupSharedNote_noteId_idx" ON "GroupSharedNote"("noteId");

-- AddForeignKey
ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSharedNote" ADD CONSTRAINT "GroupSharedNote_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSharedNote" ADD CONSTRAINT "GroupSharedNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSharedNote" ADD CONSTRAINT "GroupSharedNote_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
