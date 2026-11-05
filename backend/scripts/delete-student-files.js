import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "course-materials";

// List of student emails to delete
const STUDENT_EMAILS = [
  'hannateshomerag@gmail.com',
  'tesfayebereket909@gmail.com',
  'hanabest3939@gmail.com',
  'regassateshome1@gmail.com',
  'biniamgirma615@gmail.com',
  'amenteshomereg@gmail.com',
  'quirkyfunnymix@gmail.com',
  'nteshome93@gmail.com',
  'esuyalewj.son@gmail.com',
  'degagadesta840@gmail.com',
  'behailuberhanu91@gmail.com',
  'hiyawkal.fgm@gmail.com',
  'teshomeamenreg@gmail.com',
  'azamillu23@gmail.com',
  'teshomefenet7@gmail.com',
  'tesfayebeks@gmail.com',
  'destadegaga30@gmail.com',
  'dagmawileulseged000@gmail.com',
  'webgirma@gmail.com',
  'mahlet.ugr-6633-18@aau.edu.et',
  'dagagadasta430@gmail.com'
];

async function deleteStudentFiles() {
  console.log("[Delete] Starting deletion of Supabase files for 21 students...\n");

  // 1. Get student IDs
  console.log("[Delete] Finding student IDs...");
  const students = await prisma.student.findMany({
    where: { email: { in: STUDENT_EMAILS } },
    select: { id: true, email: true }
  });

  if (students.length === 0) {
    console.log("[Delete] No students found with those emails.");
    await prisma.$disconnect();
    return;
  }

  console.log(`[Delete] Found ${students.length} students to process.\n`);

  const studentIds = students.map(s => s.id);

  // 2. Get all files uploaded by these students
  console.log("[Delete] Finding files uploaded by these students...");
  const materials = await prisma.courseMaterial.findMany({
    where: {
      uploadedBy: { in: studentIds },
      storagePath: { not: null }
    },
    select: {
      id: true,
      storagePath: true,
      fileName: true,
      uploadedBy: true
    }
  });

  console.log(`[Delete] Found ${materials.length} files to delete.\n`);

  if (materials.length === 0) {
    console.log("[Delete] No files found for these students.");
    await prisma.$disconnect();
    return;
  }

  // 3. Display files to be deleted
  console.log("[Delete] Files to be deleted:");
  materials.forEach((mat, idx) => {
    console.log(`  ${idx + 1}. ${mat.fileName} (${mat.storagePath})`);
  });

  console.log("\n[Delete] Starting file deletion from Supabase Storage...\n");

  // 4. Delete files from Supabase
  let succeeded = 0;
  let failed = 0;

  for (const material of materials) {
    console.log(`[Delete] Deleting: ${material.fileName}`);
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([material.storagePath]);

    if (error) {
      console.error(`[Delete] ✗ Failed to delete ${material.fileName}: ${error.message}`);
      failed++;
    } else {
      console.log(`[Delete] ✓ Deleted: ${material.fileName}`);
      succeeded++;
    }
  }

  console.log(`\n[Delete] Summary:`);
  console.log(`  - Total files: ${materials.length}`);
  console.log(`  - Successfully deleted: ${succeeded}`);
  console.log(`  - Failed: ${failed}`);
  
  console.log("\n[Delete] Next step: Run the SQL script to delete database records.");
  
  await prisma.$disconnect();
}

deleteStudentFiles().catch((err) => {
  console.error("[Delete] Fatal error:", err.message);
  process.exit(1);
});
