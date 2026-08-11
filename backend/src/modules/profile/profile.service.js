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

/**
 * Get full profile including basic and academic information
 */
export async function getFullProfile(studentId) {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            emailVerified: true,
            subscriptionPlan: true,
            googleId: true,
            profile: {
                select: {
                    id: true,
                    currentYear: true,
                    currentSemester: true,
                    curriculumId: true,
                    curriculum: {
                        select: {
                            label: true,
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                    university: {
                                        select: {
                                            id: true,
                                            name: true,
                                            city: true,
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
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        emailVerified: student.emailVerified,
        subscriptionPlan: student.subscriptionPlan,
        isGoogleUser: !!student.googleId,
        profile: {
            id: student.profile.id,
            currentYear: student.profile.currentYear,
            currentSemester: student.profile.currentSemester,
            curriculum: {
                id: student.profile.curriculumId,
                label: student.profile.curriculum.label,
            },
            department: {
                id: student.profile.curriculum.department.id,
                name: student.profile.curriculum.department.name,
            },
            university: {
                id: student.profile.curriculum.department.university.id,
                name: student.profile.curriculum.department.university.name,
                city: student.profile.curriculum.department.university.city,
            },
        },
    };
}

export async function updateProfile(
    studentId,
    {
        firstName,
        lastName,
        currentYear,
        currentSemester,
    }
) {
    // ---------------------------------------------
    // 1. Check that at least one field was provided
    // ---------------------------------------------

    const hasBasicInfo =
        firstName !== undefined ||
        lastName !== undefined;

    const hasAcademicInfo =
        currentYear !== undefined ||
        currentSemester !== undefined;

    if (!hasBasicInfo && !hasAcademicInfo) {
        throw new AppError(
            "At least one profile field must be provided",
            400
        );
    }

    // ---------------------------------------------
    // 2. Validate basic information
    // ---------------------------------------------

    let trimmedFirstName;
    let trimmedLastName;

    if (firstName !== undefined) {
        if (typeof firstName !== "string") {
            throw new AppError("First name must be a string", 400);
        }

        trimmedFirstName = firstName.trim();

        if (!trimmedFirstName) {
            throw new AppError(
                "First name cannot be empty",
                400
            );
        }
    }

    if (lastName !== undefined) {
        if (typeof lastName !== "string") {
            throw new AppError("Last name must be a string", 400);
        }

        trimmedLastName = lastName.trim();

        if (!trimmedLastName) {
            throw new AppError(
                "Last name cannot be empty",
                400
            );
        }
    }

    // ---------------------------------------------
    // 3. Check student
    // ---------------------------------------------

    const student = await prisma.student.findUnique({
        where: {
            id: studentId,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    });

    if (!student) {
        throw new AppError("Account not found", 404);
    }

    // ---------------------------------------------
    // 4. Transaction
    // ---------------------------------------------

    const result = await prisma.$transaction(async (tx) => {
        let updatedStudent = student;
        let updatedProfile = null;
        let courseSelectionsCleared = false;

        // =============================================
        // BASIC INFORMATION
        // =============================================

        if (hasBasicInfo) {
            const studentData = {};

            if (firstName !== undefined) {
                studentData.firstName = trimmedFirstName;
            }

            if (lastName !== undefined) {
                studentData.lastName = trimmedLastName;
            }

            updatedStudent = await tx.student.update({
                where: {
                    id: studentId,
                },
                data: studentData,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            });
        }

        // =============================================
        // ACADEMIC INFORMATION
        // =============================================

        if (hasAcademicInfo) {
            // Get current profile
            const profile = await tx.studentProfile.findUnique({
                where: {
                    studentId,
                },
                select: {
                    id: true,
                    curriculumId: true,
                    currentYear: true,
                    currentSemester: true,
                },
            });

            if (!profile) {
                throw new AppError(
                    "Profile not found. Please complete your onboarding first",
                    404
                );
            }

            // -------------------------------------------
            // Use existing value when field isn't provided
            // -------------------------------------------

            const newYear =
                currentYear !== undefined
                    ? currentYear
                    : profile.currentYear;

            const newSemester =
                currentSemester !== undefined
                    ? currentSemester
                    : profile.currentSemester;

            // -------------------------------------------
            // Check courses for the resulting
            // year + semester
            // -------------------------------------------

            const coursesCount =
                await tx.curriculumCourse.count({
                    where: {
                        curriculumId: profile.curriculumId,
                        year: newYear,
                        semester: newSemester,
                    },
                });

            if (coursesCount === 0) {
                throw new AppError(
                    `No courses available for Year ${newYear}, Semester ${newSemester} in your curriculum. Please contact your academic advisor`,
                    400
                );
            }

            // -------------------------------------------
            // Check whether academic period changed
            // -------------------------------------------

            const yearOrSemesterChanged =
                profile.currentYear !== newYear ||
                profile.currentSemester !== newSemester;

            // -------------------------------------------
            // Update academic information
            // -------------------------------------------

            updatedProfile =
                await tx.studentProfile.update({
                    where: {
                        id: profile.id,
                    },
                    data: {
                        currentYear: newYear,
                        currentSemester: newSemester,
                    },
                    select: {
                        id: true,
                        currentYear: true,
                        currentSemester: true,
                        curriculumId: true,
                    },
                });

            // -------------------------------------------
            // Clear course selections if changed
            // -------------------------------------------

            if (yearOrSemesterChanged) {
                const deleteResult =
                    await tx.studentCourseSelection.deleteMany({
                        where: {
                            studentProfileId: profile.id,
                        },
                    });

                if (deleteResult.count > 0) {
                    courseSelectionsCleared = true;
                }
            }
        }

        return {
            student: updatedStudent,
            profile: updatedProfile,
            courseSelectionsCleared,
        };
    });

    // ---------------------------------------------
    // 5. Response
    // ---------------------------------------------

    return {
        id: result.student.id,
        firstName: result.student.firstName,
        lastName: result.student.lastName,
        email: result.student.email,

        ...(result.profile && {
            currentYear: result.profile.currentYear,
            currentSemester: result.profile.currentSemester,
            curriculumId: result.profile.curriculumId,
        }),

        courseSelectionsCleared:
            result.courseSelectionsCleared,
    };
}
