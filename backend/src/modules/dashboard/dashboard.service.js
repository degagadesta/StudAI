import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import * as examService from "../exam/exam.service.js";

const SUBSCRIPTION_LIMITS = {
    FREE: 5,
    PRO: 10,
    UNLIMITED: Infinity
};

export async function getDashboardData(studentId) {
    // Get student with profile
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            profile: {
                include: {
                    curriculum: {
                        include: {
                            department: {
                                include: {
                                    university: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    if (!student.profile) {
        throw new AppError("Please complete onboarding first", 400);
    }

    // Get enrolled courses
    const courses = await prisma.curriculumCourse.findMany({
        where: {
            curriculumId: student.profile.curriculumId,
            year: student.profile.currentYear,
            semester: student.profile.currentSemester
        },
        include: {
            course: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    // Get active PDFs count
    const activePDFs = await prisma.courseMaterial.count({
        where: {
            uploadedBy: studentId,
            status: 'READY'
        }
    });

    // Get upcoming exams
    const upcomingExams = await examService.getUpcomingExams(studentId);

    return {
        profile: {
            name: `${student.firstName} ${student.lastName}`,
            university: student.profile.curriculum.department.university.name,
            department: student.profile.curriculum.department.name,
            year: student.profile.currentYear,
            semester: student.profile.currentSemester
        },
        analytics: {
            registeredCourses: courses.length,
            activePDFs,
            maxPDFs: SUBSCRIPTION_LIMITS[student.subscriptionPlan],
            subscriptionPlan: student.subscriptionPlan,
            upcomingExams: upcomingExams.length
        },
        courses: courses.map(cc => ({
            id: cc.course.id,
            code: cc.courseCode,
            name: cc.course.title
        })),
        upcomingExams: upcomingExams.slice(0, 5) // Show only next 5
    };
}
