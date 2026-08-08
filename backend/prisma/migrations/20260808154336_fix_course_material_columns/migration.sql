/*
  Warnings:

  - You are about to drop the column `courseId` on the `CourseMaterial` table. All the data in the column will be lost.
  - Made the column `curriculumCourseId` on table `CourseMaterial` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_curriculumCourseId_fkey";

-- DropIndex
DROP INDEX "CourseMaterial_courseId_idx";

-- AlterTable
ALTER TABLE "CourseMaterial" DROP COLUMN "courseId",
ALTER COLUMN "curriculumCourseId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CourseMaterial_curriculumCourseId_idx" ON "CourseMaterial"("curriculumCourseId");

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
