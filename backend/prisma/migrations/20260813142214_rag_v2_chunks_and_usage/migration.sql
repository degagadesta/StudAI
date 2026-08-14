/*
  Warnings:

  - You are about to drop the column `tokensUsed` on the `UsageLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MaterialChunk" ADD COLUMN     "chunkIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokenCount" INTEGER;

-- AlterTable
ALTER TABLE "UsageLog" DROP COLUMN "tokensUsed",
ADD COLUMN     "inputTokens" INTEGER,
ADD COLUMN     "materialId" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "outputTokens" INTEGER,
ADD COLUMN     "totalTokens" INTEGER;

-- CreateIndex
CREATE INDEX "MaterialChunk_materialId_chunkIndex_idx" ON "MaterialChunk"("materialId", "chunkIndex");
