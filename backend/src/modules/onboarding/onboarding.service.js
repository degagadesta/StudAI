import prisma from "../../lib/prisma.js";

export const completeOnboarding = async (
    studentId,
    universityId,
    departmentId,
    currentYear,
    currentSemester
) => {
    // Validate university
    const university = await prisma.university.findUnique({
        where: {
            id: universityId,
        },
    });

    if (!university) {
        throw new Error("University not found");
    }

    // Validate department
    const department = await prisma.department.findUnique({
        where: {
            id: departmentId,
        },
    });

    if (!department) {
        throw new Error("Department not found");
    }

    if (department.universityId !== universityId) {
        throw new Error("Department does not belong to the selected university");
    }

    // Validate year
    if (currentYear < 2 || currentYear > 5) {
        throw new Error("Academic year must be between 2 and 5");
    }

    // Validate semester
    if (![1, 2].includes(currentSemester)) {
        throw new Error("Semester must be 1 or 2");
    }

    // Find curriculum automatically
    const curriculum = await prisma.curriculum.findFirst({
        where: {
            departmentId,
        },
    });

    if (!curriculum) {
        throw new Error("Curriculum not found");
    }

    // Create or update student profile
    const profile = await prisma.studentProfile.upsert({
        where: {
            studentId,
        },
        create: {
            studentId,
            curriculumId: curriculum.id,
            currentYear,
            currentSemester,
        },
        update: {
            curriculumId: curriculum.id,
            currentYear,
            currentSemester,
        },
    });

    // Load courses
    const courses = await prisma.curriculumCourse.findMany({
        where: {
            curriculumId: curriculum.id,
            year: currentYear,
            semester: currentSemester,
        },
        include: {
            course: true,
        },
        orderBy: {
            courseCode: "asc",
        },
    });

    return {
        profile,
        courses,
    };
};