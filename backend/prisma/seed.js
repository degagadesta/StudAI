import "dotenv/config"

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

  const ceDept = await prisma.department.upsert({
  where: { id: "aastu-ce-dept-id" },
  update: {},
  create: {
    id: "aastu-ce-dept-id",
    name: "Civil Engineering",
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
  const ceCurriculum = await prisma.curriculum.upsert({
  where: { id: "aastu-ce-curriculum-2024" },
  update: {},
  create: {
    id: "aastu-ce-curriculum-2024",
    label: "Curriculum 2024",
    departmentId: ceDept.id,
  },
});

  console.log("✓ Curricula created");

  // Create Courses and assign to Software Engineering curriculum
  const sweCoursesData = [
  // ============================================================
  // YEAR 1 - SEMESTER 1
  // ============================================================
  {
    title: "Logic and Critical Thinking",
    code: "Phil1009",
    year: 1,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Logic, reasoning, argumentation, and critical thinking skills.",
  },
  {
    title: "General Psychology",
    code: "Psyc1011",
    year: 1,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Introduction to psychology, human behavior, cognition, and development.",
  },
  {
    title: "Communicative English Language Skills I",
    code: "FLEn1003",
    year: 1,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Foundational English language, communication, and academic language skills.",
  },
  {
    title: "Geography of Ethiopia and the Horn",
    code: "GeEs1005",
    year: 1,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Physical and human geography of Ethiopia and the Horn of Africa.",
  },
  {
    title: "Mathematics for Natural Science",
    code: "Math1007",
    year: 1,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Mathematical foundations for science and engineering disciplines.",
  },
  {
    title: "Physical Fitness",
    code: "SpSc1013",
    year: 1,
    sem: 1,
    credits: 0,
    category: "Common Course",
    desc: "Physical fitness and health-related activities.",
  },
  {
    title: "General Physics",
    code: "Phys1001",
    year: 1,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Fundamental concepts and principles of physics.",
  },

  // ============================================================
  // YEAR 1 - SEMESTER 2
  // ============================================================
  {
    title: "Communicative English Language Skills II",
    code: "FLEn1004",
    year: 1,
    sem: 2,
    credits: 3,
    category: "Common Course",
    desc: "Advanced English communication and academic language skills.",
  },
  {
    title: "Moral and Civic Education",
    code: "MCiE1012",
    year: 1,
    sem: 2,
    credits: 2,
    category: "Common Course",
    desc: "Moral values, civic responsibility, citizenship, and ethical principles.",
  },
  {
    title: "Inclusiveness",
    code: "Incl1010",
    year: 1,
    sem: 2,
    credits: 2,
    category: "Common Course",
    desc: "Principles of inclusion, diversity, accessibility, and social participation.",
  },
  {
    title: "Social Anthropology",
    code: "Anth1002",
    year: 1,
    sem: 2,
    credits: 2,
    category: "Common Course",
    desc: "Introduction to social anthropology, culture, society, and human communities.",
  },
  {
    title: "Entrepreneurship for Engineers",
    code: "Entr1106",
    year: 1,
    sem: 2,
    credits: 3,
    category: "Common Course",
    desc: "Entrepreneurship concepts, innovation, business development, and engineering entrepreneurship.",
  },
  {
    title: "Emerging Technology for Engineers",
    code: "EmTe1108",
    year: 1,
    sem: 2,
    credits: 3,
    category: "Common Course",
    desc: "Introduction to emerging technologies and their applications in engineering.",
  },
  {
    title: "Applied Mathematics IB",
    code: "Math1014",
    year: 1,
    sem: 2,
    credits: 4,
    category: "Common Course",
    desc: "Applied mathematical concepts and techniques for engineering and computing.",
  },

  // ============================================================
  // YEAR 2 - SEMESTER 1
  // ============================================================
  {
    title: "Global Trend",
    code: "GLTr2011",
    year: 2,
    sem: 1,
    credits: 2,
    category: "Common Course",
    desc: "Contemporary global trends, globalization, and international developments.",
  },
  {
    title: "Introduction to Software Engineering and Computing",
    code: "SWEG2101",
    year: 2,
    sem: 1,
    credits: 4,
    category: "Supporting Course",
    desc: "Introduction to software engineering concepts, computing fundamentals, and software development.",
  },
  {
    title: "Fundamentals of Programming I",
    code: "SWEG2103",
    year: 2,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Fundamental programming concepts, algorithms, problem solving, and programming techniques.",
  },
  {
    title: "Discrete Mathematics for Software Engineering",
    code: "SWEG2105",
    year: 2,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Discrete mathematics including logic, sets, relations, functions, and combinatorics.",
  },
  {
    title: "History of Ethiopia and the Horn",
    code: "Hist2002",
    year: 2,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "History of Ethiopia and the Horn of Africa.",
  },
  {
    title: "Economics",
    code: "Econ2009",
    year: 2,
    sem: 1,
    credits: 3,
    category: "Common Course",
    desc: "Fundamental economic concepts, principles, and applications.",
  },

  // ============================================================
  // YEAR 2 - SEMESTER 2
  // ============================================================
  {
    title: "Fundamentals of Programming II",
    code: "SWEG2102",
    year: 2,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Advanced programming fundamentals, problem solving, and software development.",
  },
  {
    title: "Digital Logic Design",
    code: "EEng2004",
    year: 2,
    sem: 2,
    credits: 3,
    category: "Common Course",
    desc: "Boolean algebra, digital logic, logic gates, and digital circuits.",
  },
  {
    title: "Data Communication and Computer Networks",
    code: "SWEG2106",
    year: 2,
    sem: 2,
    credits: 4,
    category: "Major Course",
    desc: "Computer networking, communication systems, network protocols, and data transmission.",
  },
  {
    title: "Database Systems",
    code: "SWEG2108",
    year: 2,
    sem: 2,
    credits: 4,
    category: "Major Course",
    desc: "Relational databases, SQL, database design, normalization, and transaction management.",
  },
  {
    title: "Probability and Statistics",
    code: "Stat2091",
    year: 2,
    sem: 2,
    credits: 3,
    category: "Common Course",
    desc: "Probability theory, statistical methods, data analysis, and statistical inference.",
  },

  // ============================================================
  // YEAR 3 - SEMESTER 1
  // ============================================================
  {
    title: "Data Structure and Algorithms",
    code: "SWEG3103",
    year: 3,
    sem: 1,
    credits: 4,
    category: "Major Course",
    desc: "Data structures, algorithms, algorithm analysis, and efficient problem solving.",
  },
  {
    title: "Computer Organization and Architecture",
    code: "SWEG3105",
    year: 3,
    sem: 1,
    credits: 4,
    category: "Major Course",
    desc: "Computer organization, architecture, processor design, memory, and system components.",
  },
  {
    title: "Internet Programming I",
    code: "SWEG3107",
    year: 3,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Fundamentals of web programming and internet technologies.",
  },
  {
    title: "Object Oriented Programming",
    code: "SWEG3101",
    year: 3,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Object-oriented programming concepts including classes, inheritance, polymorphism, and encapsulation.",
  },
  {
    title: "System Analysis and Modeling",
    code: "SWEG3109",
    year: 3,
    sem: 1,
    credits: 4,
    category: "Major Course",
    desc: "System analysis, modeling techniques, requirements analysis, and software system design.",
  },

  // ============================================================
  // YEAR 3 - SEMESTER 2
  // ============================================================
  {
    title: "Internet Programming II",
    code: "SWEG3102",
    year: 3,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Advanced web programming, internet technologies, and web application development.",
  },
  {
    title: "Software Requirements Engineering",
    code: "SWEG3104",
    year: 3,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Requirements elicitation, analysis, specification, validation, and management.",
  },
  {
    title: "Operating Systems",
    code: "SWEG3106",
    year: 3,
    sem: 2,
    credits: 4,
    category: "Major Course",
    desc: "Processes, memory management, file systems, scheduling, and operating system concepts.",
  },
  {
    title: "Advanced Programming",
    code: "SWEG3108",
    year: 3,
    sem: 2,
    credits: 4,
    category: "Major Course",
    desc: "Advanced programming techniques and complex software development concepts.",
  },
  {
    title: "Formal Language and Automata Theory",
    code: "SWEG3110",
    year: 3,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Formal languages, automata, grammars, computation models, and theoretical computer science.",
  },

  // ============================================================
  // YEAR 4 - SEMESTER 1
  // ============================================================
  {
    title: "Principles of Compiler Design",
    code: "SWEG4101",
    year: 4,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Compiler architecture, lexical analysis, parsing, semantic analysis, optimization, and code generation.",
  },
  {
    title: "Mobile Computing and Programming",
    code: "SWEG4103",
    year: 4,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Mobile computing concepts and application development for mobile platforms.",
  },
  {
    title: "Software Design and Architecture",
    code: "SWEG4105",
    year: 4,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Software architecture, design principles, architectural patterns, and system design.",
  },
  {
    title: "Computer Graphics",
    code: "SWEG4109",
    year: 4,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "2D and 3D graphics, rendering, transformations, visualization, and computer graphics concepts.",
  },
  {
    title: "Introduction to Artificial Intelligence",
    code: "SWEG4107",
    year: 4,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Fundamental artificial intelligence concepts, techniques, algorithms, and applications.",
  },
  {
    title: "Integrated Engineering Team Project",
    code: "IETP4115",
    year: 4,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Interdisciplinary engineering team project focused on collaborative problem solving and practical engineering design.",
  },

  // ============================================================
  // YEAR 4 - SEMESTER 2
  // ============================================================
  {
    title: "Embedded Systems",
    code: "SWEG4102",
    year: 4,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Embedded computing systems, microcontrollers, hardware-software integration, and embedded programming.",
  },
  {
    title: "Software Project Management",
    code: "SWEG4104",
    year: 4,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Software project planning, estimation, scheduling, risk management, and project management.",
  },
  {
    title: "Software Quality Assurance and Testing",
    code: "SWEG4106",
    year: 4,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Software quality assurance, testing methodologies, test planning, and quality management.",
  },
  {
    title: "Research Methods in Software Engineering",
    code: "SWEG4108",
    year: 4,
    sem: 2,
    credits: 2,
    category: "Major Course",
    desc: "Research methodology, research design, data collection, analysis, and academic research practices.",
  },
  {
    title: "Human Computer Interaction",
    code: "SWEG4110",
    year: 4,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Human-computer interaction, usability, interface design, user experience, and interaction principles.",
  },
  {
    title: "Introduction to Machine Learning",
    code: "SWEG4112",
    year: 4,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Fundamental machine learning concepts, algorithms, model training, evaluation, and applications.",
  },

  // ============================================================
  // YEAR 4 - SUMMER
  // Prisma integer semester: 3 = Summer
  // ============================================================
  {
    title: "Industrial Internship",
    code: "SWEG4114",
    year: 4,
    sem: 3,
    credits: 6,
    category: "Major Course",
    desc: "Practical industrial experience applying software engineering knowledge in a professional environment.",
  },

  // ============================================================
  // YEAR 5 - SEMESTER 1
  // ============================================================
  {
    title: "Senior Research Project Phase I",
    code: "SWEG5101",
    year: 5,
    sem: 1,
    credits: 0,
    category: "Major Course",
    desc: "First phase of the senior research project including topic selection, literature review, planning, and initial implementation.",
  },
  {
    title: "Software Configuration Management",
    code: "SWEG5103",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Configuration management, version control, change management, and software release management.",
  },
  {
    title: "Introduction to Big Data Analytics",
    code: "SWEG5201",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Big data concepts, analytics techniques, large-scale data processing, and analytical tools.",
  },
  {
    title: "Data Mining and Data Warehousing",
    code: "SWEG5203",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Data mining techniques, data warehouses, analytical processing, and knowledge discovery.",
  },
  {
    title: "Simulation and Modeling",
    code: "SWEG5205",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Modeling and simulation techniques for analyzing and solving complex systems.",
  },
  {
    title: "Computer System Security",
    code: "SWEG5105",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Computer security principles, threats, vulnerabilities, authentication, access control, and security mechanisms.",
  },
  {
    title: "Software Component Design",
    code: "SWEG5107",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Software component design, reuse, modularity, interfaces, and component-based development.",
  },
  {
    title: "Open Source Software Paradigms",
    code: "SWEG5109",
    year: 5,
    sem: 1,
    credits: 3,
    category: "Major Course",
    desc: "Open-source software development models, licensing, collaboration, and communities.",
  },
  {
    title: "Distributed Systems",
    code: "SWEG5111",
    year: 5,
    sem: 1,
    credits: 4,
    category: "Major Course",
    desc: "Distributed computing, architectures, communication, coordination, and distributed services.",
  },

  // ============================================================
  // YEAR 5 - SEMESTER 2
  // ============================================================
  {
    title: "Senior Research Project II",
    code: "SWEG5102",
    year: 5,
    sem: 2,
    credits: 6,
    category: "Major Course",
    desc: "Final phase of the senior research project including implementation, evaluation, documentation, and presentation.",
  },
  {
    title: "Software Evolution and Maintenance",
    code: "SWEG5106",
    year: 5,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Software maintenance, evolution, refactoring, legacy systems, and software lifecycle management.",
  },
  {
    title: "Software Defined Systems",
    code: "SWEG5108",
    year: 5,
    sem: 2,
    credits: 3,
    category: "Major Course",
    desc: "Software-defined systems, programmable infrastructure, abstraction, and software-controlled computing environments.",
  },
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

  

 

  console.log("✓ Computer Science courses created");

  console.log("\n✅ Seed completed successfully!");
  console.log("\nSummary:");
  console.log(`- Universities: 3 (AASTU, AAU, ASTU)`);
  console.log(`- Departments: 3 (Software Engineering, Computer Science, ECE)`);
  console.log(`- Curricula: 2 (SWE 2024)`);
  console.log(`- Courses: ${sweCoursesData.length}`);
  console.log(`- Software Engineering: ${sweCoursesData.length} courses across 4 years`);

}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
