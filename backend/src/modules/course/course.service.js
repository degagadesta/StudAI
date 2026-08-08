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

    // Get PDFs for each course
    const coursesWithPdfs = await Promise.all(
        courses.map(async (cc) => {
            // Get PDFs uploaded by this student for this course
            const pdfs = await prisma.courseMaterial.findMany({
                where: {
                    courseId: cc.course.id,
                    uploadedBy: studentId,
                    status: "READY",
                },
                select: {
                    id: true,
                    title: true,
                    progress: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return {
                id: cc.course.id,
                code: cc.courseCode,
                name: cc.course.title,
                description: cc.course.description,
                pdfs: pdfs.map(pdf => ({
                    id: pdf.id,
                    title: pdf.title,
                    progress: pdf.progress,
                    uploadedAt: pdf.createdAt,
                })),
                pdfCount: pdfs.length,
            };
        })
    );

    return coursesWithPdfs;
};
