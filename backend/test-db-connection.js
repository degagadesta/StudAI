import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...\n");

    // Test 1: Count Universities
    const universityCount = await prisma.university.count();
    console.log(`✅ Universities: ${universityCount}`);

    // Test 2: List Universities
    const universities = await prisma.university.findMany();
    console.log("\n📚 Universities in database:");
    universities.forEach((u) => {
      console.log(`   - ${u.name} (${u.city || "N/A"})`);
    });

    // Test 3: Count Departments
    const departmentCount = await prisma.department.count();
    console.log(`\n✅ Departments: ${departmentCount}`);

    // Test 4: List Departments
    const departments = await prisma.department.findMany({
      include: { university: true },
    });
    console.log("\n🏢 Departments in database:");
    departments.forEach((d) => {
      console.log(`   - ${d.name} (${d.university.name})`);
    });

    // Test 5: Count Courses
    const courseCount = await prisma.course.count();
    console.log(`\n✅ Courses: ${courseCount}`);

    // Test 6: Sample Courses
    const sampleCourses = await prisma.curriculumCourse.findMany({
      take: 5,
      include: { course: true },
      orderBy: { courseCode: "asc" },
    });
    console.log("\n📖 Sample Courses:");
    sampleCourses.forEach((cc) => {
      console.log(`   - ${cc.courseCode}: ${cc.course.title} (${cc.creditHours} credits)`);
    });

    // Test 7: Count Students
    const studentCount = await prisma.student.count();
    console.log(`\n✅ Students: ${studentCount}`);

    // Test 8: List all tables
    console.log("\n\n📊 DATABASE SUMMARY:");
    console.log("=" .repeat(50));
    console.log(`Universities:     ${universityCount}`);
    console.log(`Departments:      ${departmentCount}`);
    console.log(`Courses:          ${courseCount}`);
    console.log(`Students:         ${studentCount}`);
    console.log("=" .repeat(50));

    console.log("\n✅ Database connection successful!");
    console.log("✅ All tables are present and populated!");

  } catch (error) {
    console.error("\n❌ Database connection failed:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
