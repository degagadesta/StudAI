-- Migration to convert CourseMaterial from courseId to curriculumCourseId
-- Run this BEFORE running prisma migrate

-- Step 1: Add new curriculumCourseId column (nullable first)
ALTER TABLE "CourseMaterial" ADD COLUMN "curriculumCourseId" TEXT;

-- Step 2: Populate curriculumCourseId based on courseId
-- This finds the first matching CurriculumCourse for each material's courseId
UPDATE "CourseMaterial" AS cm
SET "curriculumCourseId" = (
  SELECT cc.id 
  FROM "CurriculumCourse" AS cc
  WHERE cc."courseId" = cm."courseId"
  LIMIT 1
);

-- Step 3: Check if any records couldn't be migrated
SELECT COUNT(*) AS "Unmigrated Records" 
FROM "CourseMaterial" 
WHERE "curriculumCourseId" IS NULL;

-- Step 4: Delete records that couldn't be migrated (if any)
-- ONLY run this if you're okay with losing these records
-- DELETE FROM "CourseMaterial" WHERE "curriculumCourseId" IS NULL;

-- Step 5: Make curriculumCourseId NOT NULL
ALTER TABLE "CourseMaterial" ALTER COLUMN "curriculumCourseId" SET NOT NULL;

-- Step 6: Drop old courseId column
ALTER TABLE "CourseMaterial" DROP COLUMN "courseId";

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS "CourseMaterial_curriculumCourseId_idx" ON "CourseMaterial"("curriculumCourseId");
CREATE INDEX IF NOT EXISTS "CourseMaterial_uploadedBy_idx" ON "CourseMaterial"("uploadedBy");
