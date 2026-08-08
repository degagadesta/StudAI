import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export async function getAcademicProfile(studentId) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            firstName: true,
            lastName: true,
            email: true,
            profile: {
                select: {
                    currentYear: true,
                    currentSemester: true,
                    curriculum: {
                        select: {
                            label: true,
                            department: {
                                select: {
                                    name: true,
                                    university: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!student) {
        throw new AppError("Account not found", 404);
    }

    if (!student.profile) {
        throw new AppError("Please complete your onboarding first", 400);
    }

    return {
        fullName: `${student.firstName} ${student.lastName}`,
        university: student.profile.curriculum.department.university.name,
        department: student.profile.curriculum.department.name,
        year: student.profile.currentYear,
        semester: student.profile.currentSemester,
    };
}
