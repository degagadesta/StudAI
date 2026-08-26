import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_rkKMf8Ut5aDp@ep-damp-dawn-azsikabb-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const materials = await prisma.courseMaterial.findMany({
    where: {
      status: { not: "DELETED" }
    },
    select: {
      id: true,
      title: true,
      storagePath: true,
      fileData: true,
      uploadedBy: true,
    }
  });

  console.log("Materials in DB:", materials.map(m => ({
    id: m.id,
    title: m.title,
    storagePath: m.storagePath,
    hasFileData: m.fileData !== null,
    uploadedBy: m.uploadedBy,
  })));

  await prisma.$disconnect();
}

main().catch(console.error);
