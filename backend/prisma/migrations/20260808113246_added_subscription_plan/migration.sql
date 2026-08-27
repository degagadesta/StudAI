/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `CourseMaterial` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `CourseMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "subscriptionPlan" AS ENUM ('FREE', 'PRO');

-- AlterEnum
ALTER TYPE "MaterialStatus" ADD VALUE 'DELETED';

-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_curriculumCourseId_fkey";

-- DropIndex
DROP INDEX "CourseMaterial_curriculumCourseId_idx";

-- AlterTable
ALTER TABLE "CourseMaterial" DROP COLUMN "fileUrl",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "fileData" BYTEA,
ADD COLUMN     "fileSize" INTEGER,
ALTER COLUMN "curriculumCourseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "subscriptionPlan" "subscriptionPlan" NOT NULL DEFAULT 'FREE';

-- CreateIndex
CREATE INDEX "CourseMaterial_courseId_idx" ON "CourseMaterial"("courseId");

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
