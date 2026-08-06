import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Create Universities
  const aastu = await prisma.university.upsert({
    where: { id: "aastu-id" },
    update: {},
    create: {
      id: "aastu-id",
      name: "Addis Ababa Science and Technology University",
      city: "Addis Ababa",
    },
  });

  const aau = await prisma.university.upsert({
    where: { id: "aau-id" },
    update: {},
    create: {
      id: "aau-id",
      name: "Addis Ababa University",
      city: "Addis Ababa",
    },
  });

  const astu = await prisma.university.upsert({
    where: { id: "astu-id" },
    update: {},
    create: {
      id: "astu-id",
      name: "Adama Science and Technology University",
      city: "Adama",
    },
  });

  console.log("✓ Universities created");

  // Create Departments for AASTU
  const sweDept = await prisma.department.upsert({
    where: { id: "aastu-swe-dept-id" },
    update: {},
    create: {
      id: "aastu-swe-dept-id",
      name: "Software Engineering",
      universityId: aastu.id,
    },
  });

  const csDept = await prisma.department.upsert({
    where: { id: "aastu-cs-dept-id" },
    update: {},
    create: {
      id: "aastu-cs-dept-id",
      name: "Computer Science",
      universityId: aastu.id,
    },
  });

  const eceDept = await prisma.department.upsert({
    where: { id: "aastu-ece-dept-id" },
    update: {},
    create: {
      id: "aastu-ece-dept-id",
      name: "Electrical & Computer Engineering",
      universityId: aastu.id,
    },
  });

  console.log("✓ Departments created");

  // Create Curriculum for Software Engineering
  const sweCurriculum = await prisma.curriculum.upsert({
    where: { id: "aastu-swe-curriculum-2024" },
    update: {},
    create: {
      id: "aastu-swe-curriculum-2024",
      label: "Curriculum 2024",
      departmentId: sweDept.id,
    },
  });

  // Create Curriculum for Computer Science
  const csCurriculum = await prisma.curriculum.upsert({
    where: { id: "aastu-cs-curriculum-2024" },
    update: {},
    create: {
      id: "aastu-cs-curriculum-2024",
      label: "Curriculum 2024",
      departmentId: csDept.id,
    },
  });

  console.log("✓ Curricula created");

  // Create Courses and assign to Software Engineering curriculum
  const sweCoursesData = [
    // Year 1, Semester 1
    { title: "Introduction to Programming", code: "SWE101", year: 1, sem: 1, credits: 4, desc: "Basic programming concepts using Python" },
    { title: "Discrete Mathematics", code: "MAT101", year: 1, sem: 1, credits: 3, desc: "Logic, sets, relations, and graph theory" },
    { title: "Introduction to Computer Science", code: "CS101", year: 1, sem: 1, credits: 3, desc: "Overview of computer science fundamentals" },
    { title: "Communicative English I", code: "ENG101", year: 1, sem: 1, credits: 3, desc: "Academic writing and communication skills" },
    
    // Year 1, Semester 2
    { title: "Data Structures", code: "SWE102", year: 1, sem: 2, credits: 4, desc: "Arrays, linked lists, stacks, queues, trees" },
    { title: "Object-Oriented Programming", code: "SWE103", year: 1, sem: 2, credits: 4, desc: "OOP principles using Java" },
    { title: "Linear Algebra", code: "MAT102", year: 1, sem: 2, credits: 3, desc: "Vectors, matrices, and linear transformations" },
    { title: "Digital Logic Design", code: "ECE101", year: 1, sem: 2, credits: 3, desc: "Boolean algebra and digital circuits" },
    
    // Year 2, Semester 1
    { title: "Algorithms", code: "SWE201", year: 2, sem: 1, credits: 4, desc: "Algorithm design and complexity analysis" },
    { title: "Database Systems", code: "SWE202", year: 2, sem: 1, credits: 4, desc: "Relational databases, SQL, and normalization" },
    { title: "Computer Organization", code: "CS201", year: 2, sem: 1, credits: 3, desc: "Computer architecture and assembly language" },
    { title: "Probability and Statistics", code: "MAT201", year: 2, sem: 1, credits: 3, desc: "Probability theory and statistical methods" },
    
    // Year 2, Semester 2
    { title: "Web Development", code: "SWE203", year: 2, sem: 2, credits: 4, desc: "HTML, CSS, JavaScript, and web frameworks" },
    { title: "Operating Systems", code: "SWE204", year: 2, sem: 2, credits: 4, desc: "OS concepts, processes, memory management" },
    { title: "Software Engineering Principles", code: "SWE205", year: 2, sem: 2, credits: 3, desc: "SDLC, requirements, design patterns" },
    { title: "Computer Networks", code: "CS202", year: 2, sem: 2, credits: 3, desc: "Network protocols, TCP/IP, and security" },
    
    // Year 3, Semester 1
    { title: "Software Architecture", code: "SWE301", year: 3, sem: 1, credits: 4, desc: "Architectural patterns and system design" },
    { title: "Mobile Application Development", code: "SWE302", year: 3, sem: 1, credits: 4, desc: "iOS and Android development" },
    { title: "Machine Learning", code: "CS301", year: 3, sem: 1, credits: 3, desc: "ML algorithms and applications" },
    { title: "Human-Computer Interaction", code: "SWE303", year: 3, sem: 1, credits: 3, desc: "UI/UX design principles" },
    
    // Year 3, Semester 2
    { title: "Advanced Database Systems", code: "SWE304", year: 3, sem: 2, credits: 4, desc: "NoSQL, distributed databases, transaction management" },
    { title: "Cloud Computing", code: "SWE305", year: 3, sem: 2, credits: 3, desc: "Cloud platforms, services, and deployment" },
    { title: "Software Testing", code: "SWE306", year: 3, sem: 2, credits: 3, desc: "Testing methodologies and quality assurance" },
    { title: "Computer Security", code: "CS302", year: 3, sem: 2, credits: 3, desc: "Cryptography, network security, and ethical hacking" },
    
    // Year 4, Semester 1
    { title: "Distributed Systems", code: "SWE401", year: 4, sem: 1, credits: 4, desc: "Distributed architectures and microservices" },
    { title: "DevOps and CI/CD", code: "SWE402", year: 4, sem: 1, credits: 3, desc: "Automation, containerization, and deployment pipelines" },
    { title: "Software Project Management", code: "SWE403", year: 4, sem: 1, credits: 3, desc: "Agile, Scrum, and project planning" },
    { title: "Artificial Intelligence", code: "CS401", year: 4, sem: 1, credits: 3, desc: "AI techniques and intelligent systems" },
    
    // Year 4, Semester 2
    { title: "Capstone Project I", code: "SWE404", year: 4, sem: 2, credits: 4, desc: "Real-world software development project" },
    { title: "Blockchain Technology", code: "SWE405", year: 4, sem: 2, credits: 3, desc: "Blockchain fundamentals and smart contracts" },
    { title: "Big Data Analytics", code: "CS402", year: 4, sem: 2, credits: 3, desc: "Big data processing and analytics tools" },
  ];

  for (const courseData of sweCoursesData) {
    const course = await prisma.course.upsert({
      where: { id: `course-${courseData.code}` },
      update: {},
      create: {
        id: `course-${courseData.code}`,
        title: courseData.title,
        description: courseData.desc,
      },
    });

    await prisma.curriculumCourse.upsert({
      where: { id: `cc-swe-${courseData.code}` },
      update: {},
      create: {
        id: `cc-swe-${courseData.code}`,
        curriculumId: sweCurriculum.id,
        courseId: course.id,
        courseCode: courseData.code,
        creditHours: courseData.credits,
        year: courseData.year,
        semester: courseData.sem,
      },
    });
  }

  console.log("✓ Software Engineering courses created");

  // Create some Computer Science courses for Year 3, Semester 1
  const csCoursesData = [
    { title: "Advanced Algorithms", code: "CS301", year: 3, sem: 1, credits: 4, desc: "Advanced algorithmic techniques" },
    { title: "Compiler Design", code: "CS302", year: 3, sem: 1, credits: 4, desc: "Lexical analysis, parsing, code generation" },
    { title: "Theory of Computation", code: "CS303", year: 3, sem: 1, credits: 3, desc: "Automata theory and formal languages" },
    { title: "Computer Graphics", code: "CS304", year: 3, sem: 1, credits: 3, desc: "2D/3D graphics and rendering" },
  ];

  for (const courseData of csCoursesData) {
    const course = await prisma.course.upsert({
      where: { id: `course-${courseData.code}` },
      update: {},
      create: {
        id: `course-${courseData.code}`,
        title: courseData.title,
        description: courseData.desc,
      },
    });

    await prisma.curriculumCourse.upsert({
      where: { id: `cc-cs-${courseData.code}` },
      update: {},
      create: {
        id: `cc-cs-${courseData.code}`,
        curriculumId: csCurriculum.id,
        courseId: course.id,
        courseCode: courseData.code,
        creditHours: courseData.credits,
        year: courseData.year,
        semester: courseData.sem,
      },
    });
  }

  console.log("✓ Computer Science courses created");

  console.log("\n✅ Seed completed successfully!");
  console.log("\nSummary:");
  console.log(`- Universities: 3 (AASTU, AAU, ASTU)`);
  console.log(`- Departments: 3 (Software Engineering, Computer Science, ECE)`);
  console.log(`- Curricula: 2 (SWE 2024, CS 2024)`);
  console.log(`- Courses: ${sweCoursesData.length + csCoursesData.length}`);
  console.log(`- Software Engineering: ${sweCoursesData.length} courses across 4 years`);
  console.log(`- Computer Science: ${csCoursesData.length} courses`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
