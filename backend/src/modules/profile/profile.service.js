import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export async function getAcademicProfile(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      subscriptionPlan: true,
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

  console.log("user profile: ", student);

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
    subscriptionPlan: student.subscriptionPlan,
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

/**
 * Update basic student information (name)
 */
export async function updateBasicInfo(studentId, { firstName, lastName }) {
    // Trim whitespace
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
    });

    if (!student) {
        throw new AppError("Account not found", 404);
    }

    // Update student record
    const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    });

    return {
        id: updatedStudent.id,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
    };
}

/**
 * Update academic information (year/semester)
 */
export async function updateAcademicInfo(studentId, { currentYear, currentSemester }) {
    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
        where: { studentId },
        select: {
            id: true,
            curriculumId: true,
            currentYear: true,
            currentSemester: true,
        },
    });

    if (!profile) {
        throw new AppError("Profile not found. Please complete your onboarding first", 404);
    }

    // Check if courses exist for the new year/semester in student's curriculum
    const coursesCount = await prisma.curriculumCourse.count({
        where: {
            curriculumId: profile.curriculumId,
            year: currentYear,
            semester: currentSemester,
        },
    });

    if (coursesCount === 0) {
        throw new AppError(
            `No courses available for Year ${currentYear}, Semester ${currentSemester} in your curriculum. Please contact your academic advisor`,
            400
        );
    }

    // Check if year/semester changed
    const yearOrSemesterChanged =
        profile.currentYear !== currentYear || profile.currentSemester !== currentSemester;

    let courseSelectionsCleared = false;

    // Use transaction to update profile and clear course selections if needed
    await prisma.$transaction(async (tx) => {
        // Update profile
        await tx.studentProfile.update({
            where: { id: profile.id },
            data: {
                currentYear,
                currentSemester,
            },
        });

        // If year/semester changed, clear old course selections
        if (yearOrSemesterChanged) {
            const deleteResult = await tx.studentCourseSelection.deleteMany({
                where: { studentProfileId: profile.id },
            });

            if (deleteResult.count > 0) {
                courseSelectionsCleared = true;
            }
        }
    });

    // Get updated profile with full details
    const updatedProfile = await prisma.studentProfile.findUnique({
        where: { id: profile.id },
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
    });

    return {
        currentYear: updatedProfile.currentYear,
        currentSemester: updatedProfile.currentSemester,
        coursesAvailable: coursesCount,
        courseSelectionsCleared,
        curriculum: updatedProfile.curriculum.label,
        department: updatedProfile.curriculum.department.name,
        university: updatedProfile.curriculum.department.university.name,
    };
}
