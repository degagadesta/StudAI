import prisma from "../../lib/prisma.js";

export const getStudentCourses = async (studentId) => {
    // Find the student's academic profile
    const profile = await prisma.studentProfile.findUnique({
        where: {
            studentId,
        },
    });

    if (!profile) {
        throw new Error("Student has not completed academic onboarding.");
    }

    // Load courses for the student's current year and semester
    const courses = await prisma.curriculumCourse.findMany({
        where: {
            curriculumId: profile.curriculumId,
            year: profile.currentYear,
            semester: profile.currentSemester,
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

    return courses;
};