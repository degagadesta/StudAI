-- CreateTable
CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "textSelection" JSONB,
    "color" TEXT DEFAULT 'yellow',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bookmark_studentId_materialId_idx" ON "Bookmark"("studentId", "materialId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bookmark_materialId_idx" ON "Bookmark"("materialId");

-- AddForeignKey (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Bookmark_materialId_fkey'
    ) THEN
        ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_materialId_fkey" 
        FOREIGN KEY ("materialId") REFERENCES "CourseMaterial"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Bookmark_studentId_fkey'
    ) THEN
        ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_studentId_fkey" 
        FOREIGN KEY ("studentId") REFERENCES "Student"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
