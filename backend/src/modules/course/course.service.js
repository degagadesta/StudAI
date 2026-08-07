import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export const getStudentCourses = async (studentId) => {
    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (!student) {
        throw new AppError("Account not found. Please log in again", 404);
    }

    // Find the student's academic profile
    const profile = await prisma.studentProfile.findUnique({
        where: {
            studentId,
        },
    });

    if (!profile) {
        throw new AppError("Please complete your profile setup to view your courses", 400);
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