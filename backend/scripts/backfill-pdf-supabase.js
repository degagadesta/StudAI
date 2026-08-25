import { prisma } from "../src/lib/prisma.js";
import { uploadPDFToStorage } from "../src/lib/supabase.js";

async function runBackfill() {
  console.log("[Backfill] Starting Supabase PDF storage backfill...");

  // Find all course materials that have fileData but lack storagePath, and are not deleted
  const materials = await prisma.courseMaterial.findMany({
    where: {
      fileData: { not: null },
      storagePath: null,
      status: { not: "DELETED" },
    },
    select: {
      id: true,
      title: true,
      fileData: true,
      uploadedBy: true,
    },
  });

  console.log(`[Backfill] Found ${materials.length} materials to backfill.`);

  let succeeded = 0;
  let failed = 0;

  for (const material of materials) {
    const studentId = material.uploadedBy || "legacy-student";
    const storagePath = `${studentId}/${material.id}/${material.title}`;
    console.log(`[Backfill] Uploading material ${material.id} ("${material.title}") to ${storagePath}...`);

    try {
      // 1. Upload to Supabase Storage
      await uploadPDFToStorage(storagePath, material.fileData, "application/pdf");

      // 2. Update storagePath in Database
      await prisma.courseMaterial.update({
        where: { id: material.id },
        data: { storagePath },
      });

      succeeded++;
      console.log(`[Backfill] Successfully backfilled material ${material.id}`);
    } catch (err) {
      failed++;
      console.error(`[Backfill] Failed to backfill material ${material.id}:`, err.message);
    }
  }

  console.log(`[Backfill] Completed. Succeeded: ${succeeded}, Failed: ${failed}`);
}

runBackfill()
  .catch((err) => {
    console.error("[Backfill] Critical failure:", err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
