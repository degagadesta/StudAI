/*
  Warnings:

  - The values [QUIZ] on the enum `ExamType` will be removed. If these variants are still used in the database, this will fail.
  - The values [DELETED] on the enum `MaterialStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `courseId` on the `ChatSession` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `CourseMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileData` on the `CourseMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `CourseMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `GeneratedExam` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `PastExam` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `TopicStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `WeakTopic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[curriculumId,courseId,year,semester]` on the table `CurriculumCourse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `curriculumCourseId` to the `ChatSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumCourseId` to the `CourseMaterial` table without a default value. This is not possible if the table is not empty.
  - Made the column `fileUrl` on table `CourseMaterial` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `curriculumCourseId` to the `GeneratedExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumCourseId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumCourseId` to the `PastExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumCourseId` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumCourseId` to the `TopicStatistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curriculumCourseId` to the `WeakTopic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExamType_new" AS ENUM ('MID', 'FINAL');
ALTER TABLE "PastExam" ALTER COLUMN "type" TYPE "ExamType_new" USING ("type"::text::"ExamType_new");
ALTER TYPE "ExamType" RENAME TO "ExamType_old";
ALTER TYPE "ExamType_new" RENAME TO "ExamType";
DROP TYPE "public"."ExamType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MaterialStatus_new" AS ENUM ('QUEUED', 'EXTRACTING', 'ANALYZING', 'READY', 'FAILED');
ALTER TABLE "public"."CourseMaterial" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CourseMaterial" ALTER COLUMN "status" TYPE "MaterialStatus_new" USING ("status"::text::"MaterialStatus_new");
ALTER TYPE "MaterialStatus" RENAME TO "MaterialStatus_old";
ALTER TYPE "MaterialStatus_new" RENAME TO "MaterialStatus";
DROP TYPE "public"."MaterialStatus_old";
ALTER TABLE "CourseMaterial" ALTER COLUMN "status" SET DEFAULT 'QUEUED';
COMMIT;

-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_courseId_fkey";

-- DropForeignKey
ALTER TABLE "GeneratedExam" DROP CONSTRAINT "GeneratedExam_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_courseId_fkey";

-- DropForeignKey
ALTER TABLE "PastExam" DROP CONSTRAINT "PastExam_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_courseId_fkey";

-- DropForeignKey
ALTER TABLE "TopicStatistic" DROP CONSTRAINT "TopicStatistic_courseId_fkey";

-- DropForeignKey
ALTER TABLE "WeakTopic" DROP CONSTRAINT "WeakTopic_courseId_fkey";

-- DropIndex
DROP INDEX "ChatSession_studentId_courseId_idx";

-- DropIndex
DROP INDEX "CourseMaterial_courseId_idx";

-- DropIndex
DROP INDEX "Note_studentId_courseId_idx";

-- DropIndex
DROP INDEX "PastExam_courseId_idx";

-- DropIndex
DROP INDEX "Student_refreshToken_key";

-- DropIndex
DROP INDEX "TopicStatistic_courseId_idx";

-- DropIndex
DROP INDEX "WeakTopic_studentId_courseId_idx";

-- AlterTable
ALTER TABLE "ChatSession" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CourseMaterial" DROP COLUMN "courseId",
DROP COLUMN "fileData",
DROP COLUMN "fileSize",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "GeneratedExam" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PastExam" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "refreshToken",
DROP COLUMN "subscriptionPlan",
ADD COLUMN     "refreshTokenHash" TEXT;

-- AlterTable
ALTER TABLE "TopicStatistic" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "shortName" TEXT;

-- AlterTable
ALTER TABLE "WeakTopic" DROP COLUMN "courseId",
ADD COLUMN     "curriculumCourseId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- CreateTable
CREATE TABLE "StudentCourseSelection" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "curriculumCourseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentCourseSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentCourseSelection_studentProfileId_idx" ON "StudentCourseSelection"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourseSelection_studentProfileId_curriculumCourseId_key" ON "StudentCourseSelection"("studentProfileId", "curriculumCourseId");

-- CreateIndex
CREATE INDEX "ChatSession_studentId_curriculumCourseId_idx" ON "ChatSession"("studentId", "curriculumCourseId");

-- CreateIndex
CREATE INDEX "CourseMaterial_curriculumCourseId_idx" ON "CourseMaterial"("curriculumCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumCourse_curriculumId_courseId_year_semester_key" ON "CurriculumCourse"("curriculumId", "courseId", "year", "semester");

-- CreateIndex
CREATE INDEX "GeneratedExam_curriculumCourseId_idx" ON "GeneratedExam"("curriculumCourseId");

-- CreateIndex
CREATE INDEX "Note_studentId_curriculumCourseId_idx" ON "Note"("studentId", "curriculumCourseId");

-- CreateIndex
CREATE INDEX "PastExam_curriculumCourseId_idx" ON "PastExam"("curriculumCourseId");

-- CreateIndex
CREATE INDEX "Quiz_curriculumCourseId_idx" ON "Quiz"("curriculumCourseId");

-- CreateIndex
CREATE INDEX "TopicStatistic_curriculumCourseId_idx" ON "TopicStatistic"("curriculumCourseId");

-- CreateIndex
CREATE INDEX "WeakTopic_studentId_curriculumCourseId_idx" ON "WeakTopic"("studentId", "curriculumCourseId");

-- AddForeignKey
ALTER TABLE "StudentCourseSelection" ADD CONSTRAINT "StudentCourseSelection_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourseSelection" ADD CONSTRAINT "StudentCourseSelection_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PastExam" ADD CONSTRAINT "PastExam_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicStatistic" ADD CONSTRAINT "TopicStatistic_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedExam" ADD CONSTRAINT "GeneratedExam_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeakTopic" ADD CONSTRAINT "WeakTopic_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
