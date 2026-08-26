import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "course-materials";

async function listAllFiles(folder = "") {
  const files = [];
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });
  if (error) throw new Error(`Failed to list files in "${folder}": ${error.message}`);

  for (const item of data) {
    if (item.id === null) {
      // It's a folder — recurse into it
      const subPath = folder ? `${folder}/${item.name}` : item.name;
      const subFiles = await listAllFiles(subPath);
      files.push(...subFiles);
    } else {
      // It's a real file
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      files.push(fullPath);
    }
  }

  return files;
}

async function runCleanup() {
  console.log("[Cleanup] Starting orphan file cleanup in Supabase Storage...\n");

  // 1. Get all files currently in Supabase bucket
  console.log("[Cleanup] Listing all files in Supabase bucket...");
  const allStorageFiles = await listAllFiles();
  console.log(`[Cleanup] Found ${allStorageFiles.length} total files in bucket.\n`);

  if (allStorageFiles.length === 0) {
    console.log("[Cleanup] Bucket is empty. Nothing to clean up.");
    await prisma.$disconnect();
    return;
  }

  // 2. Get all valid storagePaths from the database (non-deleted materials)
  console.log("[Cleanup] Fetching valid storage paths from database...");
  const activeMaterials = await prisma.courseMaterial.findMany({
    where: { storagePath: { not: null } },
    select: { storagePath: true },
  });
  const validPaths = new Set(activeMaterials.map((m) => m.storagePath));
  console.log(`[Cleanup] Found ${validPaths.size} valid paths in database.\n`);

  // 3. Find orphaned files (in Supabase but not in DB)
  const orphans = allStorageFiles.filter((path) => !validPaths.has(path));
  console.log(`[Cleanup] Found ${orphans.length} orphaned file(s) to delete.`);

  if (orphans.length === 0) {
    console.log("[Cleanup] No orphans found. Bucket is clean!");
    await prisma.$disconnect();
    return;
  }

  // 4. Delete orphaned files
  console.log("");
  let succeeded = 0;
  let failed = 0;

  for (const path of orphans) {
    console.log(`[Cleanup] Deleting orphan: ${path}`);
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error(`[Cleanup] ✗ Failed to delete ${path}: ${error.message}`);
      failed++;
    } else {
      console.log(`[Cleanup] ✓ Deleted: ${path}`);
      succeeded++;
    }
  }

  console.log(`\n[Cleanup] Done. Deleted: ${succeeded}, Failed: ${failed}`);
  await prisma.$disconnect();
}

runCleanup().catch((err) => {
  console.error("[Cleanup] Fatal error:", err.message);
  process.exit(1);
});
