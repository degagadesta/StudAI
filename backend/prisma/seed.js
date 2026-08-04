import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const university = await prisma.university.create({
    data: {
      name: "Addis Ababa Science and Technology University",
      city: "Addis Ababa",
    },
  });

  const department = await prisma.department.create({
    data: { name: "Software Engineering", universityId: university.id },
  });

  const curriculum = await prisma.curriculum.create({
    data: { label: "Curriculum 2024", departmentId: department.id },
  });

  const courseNames = [
    "Operating Systems",
    "Database Systems",
    "Computer Networks",
  ];
  for (const [i, title] of courseNames.entries()) {
    const course = await prisma.course.create({ data: { title } });
    await prisma.curriculumCourse.create({
      data: {
        curriculumId: curriculum.id,
        courseId: course.id,
        courseCode: `CS30${i + 1}`,
        creditHours: 3,
        year: 3,
        semester: 2,
      },
    });
  }

  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
