-- CreateTable
CREATE TABLE "PdfHighlight" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "textContent" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PdfHighlight_studentId_materialId_idx" ON "PdfHighlight"("studentId", "materialId");

-- CreateIndex
CREATE INDEX "PdfHighlight_materialId_idx" ON "PdfHighlight"("materialId");

-- CreateIndex
CREATE INDEX "PdfHighlight_studentId_idx" ON "PdfHighlight"("studentId");

-- CreateIndex
CREATE INDEX "PdfNote_studentId_materialId_idx" ON "PdfNote"("studentId", "materialId");

-- CreateIndex
CREATE INDEX "PdfNote_materialId_idx" ON "PdfNote"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "PdfNote_studentId_materialId_key" ON "PdfNote"("studentId", "materialId");

-- AddForeignKey
ALTER TABLE "PdfHighlight" ADD CONSTRAINT "PdfHighlight_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfHighlight" ADD CONSTRAINT "PdfHighlight_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "CourseMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfNote" ADD CONSTRAINT "PdfNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfNote" ADD CONSTRAINT "PdfNote_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "CourseMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
