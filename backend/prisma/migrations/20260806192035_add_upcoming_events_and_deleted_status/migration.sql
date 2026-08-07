-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'UNLIMITED');

-- AlterEnum
ALTER TYPE "ExamType" ADD VALUE 'QUIZ';

-- AlterEnum
ALTER TYPE "MaterialStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "CourseMaterial" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "uploadedBy" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "UpcomingEvent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpcomingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpcomingEvent_studentId_idx" ON "UpcomingEvent"("studentId");

-- CreateIndex
CREATE INDEX "UpcomingEvent_eventDate_idx" ON "UpcomingEvent"("eventDate");

-- CreateIndex
CREATE INDEX "CourseMaterial_uploadedBy_idx" ON "CourseMaterial"("uploadedBy");

-- AddForeignKey
ALTER TABLE "UpcomingEvent" ADD CONSTRAINT "UpcomingEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
