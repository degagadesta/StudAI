import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export const getStudentCourses = async (studentId) => {
    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    // Find the student's academic profile
    const profile = await prisma.studentProfile.findUnique({
        where: {
            studentId,
        },
    });

    if (!profile) {
        throw new AppError("Please complete academic onboarding first", 400);
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

    return courses.map(cc => ({
        id: cc.course.id,
        code: cc.courseCode,
        name: cc.course.title
    }));
};