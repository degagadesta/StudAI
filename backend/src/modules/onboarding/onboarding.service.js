import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

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
        throw new AppError("University not found", 404);
    }

    // Validate department
    const department = await prisma.department.findUnique({
        where: {
            id: departmentId,
        },
    });

    if (!department) {
        throw new AppError("Department not found", 404);
    }

    if (department.universityId !== universityId) {
        throw new AppError("Department does not belong to the selected university", 400);
    }

    // Validate year
    if (currentYear < 2 || currentYear > 5) {
        throw new AppError("Academic year must be between 2 and 5", 400);
    }

    // Validate semester
    if (![1, 2].includes(currentSemester)) {
        throw new AppError("Semester must be 1 or 2", 400);
    }

    // Find curriculum automatically
    const curriculum = await prisma.curriculum.findFirst({
        where: {
            departmentId,
        },
    });

    if (!curriculum) {
        throw new AppError("No curriculum found for this department", 404);
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

        // Load courses
        const courses = await tx.curriculumCourse.findMany({
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
    });
};