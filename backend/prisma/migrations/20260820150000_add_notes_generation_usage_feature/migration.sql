-- AlterEnum
ALTER TYPE "UsageFeature" ADD VALUE 'NOTES_GENERATION';

-- AlterTable
ALTER TABLE "CourseMaterial" ADD COLUMN "processingError" TEXT;