-- CreateEnum
CREATE TYPE "UsageFeature" AS ENUM ('SUMMARY', 'FLASHCARDS', 'CHAT_MESSAGE');

-- AlterEnum
ALTER TYPE "subscriptionPlan" ADD VALUE 'STANDARD';

-- AlterTable
ALTER TABLE "MaterialChunk" ADD COLUMN     "embedding" DOUBLE PRECISION[];

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feature" "UsageFeature" NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageLog_studentId_feature_createdAt_idx" ON "UsageLog"("studentId", "feature", "createdAt");

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
