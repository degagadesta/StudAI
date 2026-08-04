-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Student_refreshToken_key" ON "Student"("refreshToken");
