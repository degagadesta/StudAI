import { prisma } from "../../lib/prisma.js";

export async function getUpcomingExams(studentId) {
    // Get student's profile and courses
    const profile = await prisma.studentProfile.findUnique({
        where: { studentId },
        select: { curriculumId: true }
    });

    if (!profile) {
        return [];
    }

    // Get student's enrolled courses
    const enrolledCourses = await prisma.curriculumCourse.findMany({
        where: {
            curriculumId: profile.curriculumId
        },
        select: {
            courseId: true
        }
    });

    const courseIds = enrolledCourses.map(ec => ec.courseId);

    if (courseIds.length === 0) {
        return [];
    }

    // Get upcoming past exams (using year > current year as "upcoming")
    const currentYear = new Date().getFullYear();
    const exams = await prisma.pastExam.findMany({
        where: {
            courseId: { in: courseIds },
            year: { gte: currentYear }
        },
        include: {
            course: {
                select: {
                    title: true
                }
            }
        },
        orderBy: {
            year: 'asc'
        },
        take: 10 // Limit to 10 upcoming exams
    });

    return exams.map(exam => ({
        id: exam.id,
        courseName: exam.course.title,
        examType: exam.type,
        examDate: `${exam.year}-${exam.type === 'MID' ? '03' : '06'}-01`, // Mock date
        year: exam.year
    }));
}
