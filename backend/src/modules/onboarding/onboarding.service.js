import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Get available courses for a specific university, department, year, and semester
 */
export const getAvailableCourses = async (
    universityId,
    departmentId,
    year,
    semester
) => {
    // Validate university
    const university = await prisma.university.findUnique({
        where: { id: universityId },
    });

    if (!university) {
        throw new Error("University not found");
    }

    // Validate department
    const department = await prisma.department.findUnique({
        where: { id: departmentId },
    });

    if (!department) {
        throw new Error("Department not found");
    }

    if (department.universityId !== universityId) {
        throw new Error("Department does not belong to the selected university");
    }

    // Validate year and semester
    if (year < 1 || year > 5) {
        throw new Error("Academic year must be between 1 and 5");
    }

    if (![1, 2].includes(semester)) {
        throw new Error("Semester must be 1 or 2");
    }

    // Find curriculum for this department
    const curriculum = await prisma.curriculum.findFirst({
        where: { departmentId },
    });

    if (!curriculum) {
        throw new Error("Curriculum not found for this department");
    }

    // Get courses for this year and semester
    const curriculumCourses = await prisma.curriculumCourse.findMany({
        where: {
            curriculumId: curriculum.id,
            year,
            semester,
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                },
            },
        },
        orderBy: {
            courseCode: "asc",
        },
    });

    // Transform data for frontend
    return curriculumCourses.map((cc) => ({
        id: cc.id, // Return CurriculumCourse ID (not Course ID)
        courseId: cc.course.id, // Include generic Course ID for reference
        courseCode: cc.courseCode,
        title: cc.course.title,
        description: cc.course.description,
        creditHours: cc.creditHours,
        year: cc.year,
        semester: cc.semester,
    }));
};

export const completeOnboarding = async (
    studentId,
    universityId,
    departmentId,
    currentYear,
    currentSemester,
    selectedCourseIds = []
) => {
    // Validate university
    const university = await prisma.university.findUnique({
        where: {
            id: universityId,
        },
    });

    if (!university) {
        throw new AppError("University not found. Please select a valid university", 404);
    }

    // Validate department
    const department = await prisma.department.findUnique({
        where: {
            id: departmentId,
        },
    });

    if (!department) {
        throw new AppError("Department not found. Please select a valid department", 404);
    }

    if (department.universityId !== universityId) {
        throw new AppError("This department doesn't belong to the selected university. Please choose a different department", 400);
    }

    // Validate year
    if (currentYear < 1 || currentYear > 5) {
        throw new AppError("Please select a valid academic year (1-5)", 400);
    }

    // Validate semester
    if (![1, 2].includes(currentSemester)) {
        throw new AppError("Please select a valid semester (1 or 2)", 400);
    }

    // Find curriculum automatically
    const curriculum = await prisma.curriculum.findFirst({
        where: {
            departmentId,
        },
    });

    if (!curriculum) {
        throw new AppError("No courses available for this department yet. Please contact support", 404);
    }

    // Validate selected courses if provided
    if (selectedCourseIds && selectedCourseIds.length > 0) {
        const validCourses = await prisma.curriculumCourse.findMany({
            where: {
                curriculumId: curriculum.id,
                year: currentYear,
                semester: currentSemester,
                id: {
                    in: selectedCourseIds,
                },
            },
        });

        if (validCourses.length !== selectedCourseIds.length) {
            throw new AppError("Some courses you selected are not available for this year and semester. Please review your selections", 400);
        }
    }

    // Use transaction for data consistency
    return await prisma.$transaction(async (tx) => {
        // Create or update student profile
        const profile = await tx.studentProfile.upsert({
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

        // Load courses for the selected year and semester
        const courses = await tx.curriculumCourse.findMany({
            where: {
                curriculumId: curriculum.id,
                year: currentYear,
                semester: currentSemester,
                // If specific courses were selected, only return those
                ...(selectedCourseIds && selectedCourseIds.length > 0
                    ? { id: { in: selectedCourseIds } }
                    : {}),
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                },
            },
            orderBy: {
                courseCode: "asc",
            },
        });

        // Transform courses for response
        const transformedCourses = courses.map((cc) => ({
            id: cc.id, // Return CurriculumCourse ID (not Course ID)
            courseId: cc.course.id, // Include generic Course ID for reference
            courseCode: cc.courseCode,
            title: cc.course.title,
            description: cc.course.description,
            creditHours: cc.creditHours,
            year: cc.year,
            semester: cc.semester,
        }));

        return {
            profile,
            courses: transformedCourses,
        };
    });
};