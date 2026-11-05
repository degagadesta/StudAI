import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function deleteStudents() {
  const emailsToDelete = [
    "tesfayebereket909@gmail.com",
    "tesfayebeks@gmail.com"
  ];

  console.log("Starting student deletion...\n");

  for (const email of emailsToDelete) {
    try {
      // Find student
      const student = await prisma.student.findUnique({
        where: { email },
        include: {
          profile: true,
        },
      });

      if (!student) {
        console.log(`❌ Student not found: ${email}`);
        continue;
      }

      console.log(`Found student: ${email} (ID: ${student.id})`);

      // Delete student (cascade will handle related records)
      await prisma.student.delete({
        where: { id: student.id },
      });

      console.log(`✅ Successfully deleted: ${email}\n`);
    } catch (error) {
      console.error(`❌ Error deleting ${email}:`, error.message, "\n");
    }
  }

  console.log("Deletion complete!");
}

deleteStudents()
  .catch((e) => {
    console.error("Script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
