import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export const getStudentCoursesByYear = async (studentId, searchQuery = null) => {
  // Check if student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
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
    throw new AppError(
      "Please complete your academic profile setup first. Go to the onboarding page to select your university, department, and courses",
      400,
    );
  }

  // Build course filter with optional search
  const courseFilter = {
    curriculumId: profile.curriculumId,
    year: profile.currentYear,
    semester: profile.currentSemester,
  };

  // Add search filter if provided (search by course name)
  if (searchQuery && searchQuery.trim()) {
    courseFilter.course = {
      title: {
        contains: searchQuery.trim(),
        mode: "insensitive", // Case-insensitive search
      },
    };
  }

  // Load courses for the student's current year and semester
  const courses = await prisma.curriculumCourse.findMany({
    where: courseFilter,
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

  // Get PDFs for each course with optional search
  const coursesWithPdfs = await Promise.all(
    courses.map(async (cc) => {
      // Build PDF filter
      const pdfFilter = {
        curriculumCourseId: cc.id,
        uploadedBy: studentId,
        status: "READY",
      };

      // Add search filter if provided (search by PDF title)
      if (searchQuery && searchQuery.trim()) {
        pdfFilter.title = {
          contains: searchQuery.trim(),
          mode: "insensitive", // Case-insensitive search
        };
      }

      // Get PDFs uploaded by this student for this specific curriculum course
      const pdfs = await prisma.courseMaterial.findMany({
        where: pdfFilter,
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
        id: cc.id, // Return CurriculumCourse ID, not Course ID
        courseId: cc.course.id, // Include generic Course ID for reference
        code: cc.courseCode,
        name: cc.course.title,
        description: cc.course.description,
        pdfs: pdfs.map((pdf) => ({
          id: pdf.id,
          title: pdf.title,
          progress: pdf.progress,
          uploadedAt: pdf.createdAt,
        })),
        pdfCount: pdfs.length,
      };
    }),
  );

  // Filter out courses with no PDFs if searching (only show courses with matching PDFs or matching course names)
  if (searchQuery && searchQuery.trim()) {
    const filteredCourses = coursesWithPdfs.filter((course) => {
      // Keep course if it has matching PDFs or if course name matches
      const courseNameMatches = course.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const hasPdfs = course.pdfCount > 0;
      return courseNameMatches || hasPdfs;
    });
    return filteredCourses;
  }

  return coursesWithPdfs;
};

export const getStudentCourses = async (studentId, searchQuery = null) => {
  // Check if student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError("Account not found. Please log in again", 404);
  }

  // Find the student's academic profile
  const profile = await prisma.studentProfile.findUnique({
    where: {
      studentId,
    },
    include: {
      selections: {
        include: {
          curriculumCourse: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    throw new AppError(
      "Please complete your academic profile setup first. Go to the onboarding page to select your university, department, and courses",
      400,
    );
  }

  // Get all enrolled courses from StudentCourseSelection
  const enrolledCourses = profile.selections || [];

  // Get PDFs for each enrolled course
  const coursesWithPdfs = await Promise.all(
    enrolledCourses.map(async (selection) => {
      const cc = selection.curriculumCourse;

      // Build PDF filter
      const pdfFilter = {
        curriculumCourseId: cc.id,
        uploadedBy: studentId,
        status: "READY",
      };

      // Add search filter if provided (search by PDF title)
      if (searchQuery && searchQuery.trim()) {
        pdfFilter.title = {
          contains: searchQuery.trim(),
          mode: "insensitive",
        };
      }

      // Get PDFs uploaded by this student for this specific curriculum course
      const pdfs = await prisma.courseMaterial.findMany({
        where: pdfFilter,
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
        id: cc.id, // Return CurriculumCourse ID, not Course ID
        courseId: cc.course.id, // Include generic Course ID for reference
        code: cc.courseCode,
        name: cc.course.title,
        description: cc.course.description,
        pdfs: pdfs.map((pdf) => ({
          id: pdf.id,
          title: pdf.title,
          progress: pdf.progress,
          uploadedAt: pdf.createdAt,
        })),
        pdfCount: pdfs.length,
      };
    }),
  );

  // Filter by search query if provided
  if (searchQuery && searchQuery.trim()) {
    const filteredCourses = coursesWithPdfs.filter((course) => {
      const courseNameMatches = course.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const courseCodeMatches = course.code
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const hasPdfs = course.pdfCount > 0;
      return courseNameMatches || courseCodeMatches || hasPdfs;
    });
    return filteredCourses;
  }

  return coursesWithPdfs;
};

/**
 * Add course to student's selection
 */
export async function addCourseSelection(studentId, curriculumCourseId) {
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
    throw new AppError("Please complete your onboarding first", 404);
  }

  const curriculumCourse = await prisma.curriculumCourse.findUnique({
    where: { id: curriculumCourseId },
    include: {
      course: {
        select: { title: true },
      },
    },
  });

  if (!curriculumCourse) {
    throw new AppError("Course not found", 404);
  }

  // Still enforce: course must belong to the student's own curriculum
  if (curriculumCourse.curriculumId !== profile.curriculumId) {
    throw new AppError("This course is not part of your curriculum", 400);
  }

  // Year/semester match check removed — students can select courses
  // from any year/semester within their curriculum.

  const existing = await prisma.studentCourseSelection.findUnique({
    where: {
      studentProfileId_curriculumCourseId: {
        studentProfileId: profile.id,
        curriculumCourseId,
      },
    },
  });

  if (existing) {
    throw new AppError("This course is already in your schedule", 409);
  }

  const selection = await prisma.studentCourseSelection.create({
    data: {
      studentProfileId: profile.id,
      curriculumCourseId,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  const totalSelections = await prisma.studentCourseSelection.count({
    where: { studentProfileId: profile.id },
  });

  return {
    selectionId: selection.id,
    course: {
      courseCode: curriculumCourse.courseCode,
      title: curriculumCourse.course.title,
      year: curriculumCourse.year,
      semester: curriculumCourse.semester,
      creditHours: curriculumCourse.creditHours,
    },
    currentSelections: totalSelections,
    selectedAt: selection.createdAt,
  };
}

/**
 * Drop course from student's selection and delete all associated PDFs
 */
export async function dropCourseSelection(studentId, curriculumCourseId) {
  // Get student profile
  const profile = await prisma.studentProfile.findUnique({
    where: { studentId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError("Please complete your onboarding first", 404);
  }

  // Find the course selection
  const selection = await prisma.studentCourseSelection.findUnique({
    where: {
      studentProfileId_curriculumCourseId: {
        studentProfileId: profile.id,
        curriculumCourseId,
      },
    },
    include: {
      curriculumCourse: {
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!selection) {
    throw new AppError("This course is not in your schedule", 404);
  }

  let deletedPDFCount = 0;

  // Use transaction to ensure atomic deletion
  await prisma.$transaction(async (tx) => {
    // Find all PDFs uploaded by this student for this course
    const pdfs = await tx.courseMaterial.findMany({
      where: {
        curriculumCourseId,
        uploadedBy: studentId,
      },
      select: { id: true },
    });

    deletedPDFCount = pdfs.length;

    // Delete all related data for each PDF
    for (const pdf of pdfs) {
      // Delete material chunks
      await tx.materialChunk.deleteMany({
        where: { materialId: pdf.id },
      });

      // Delete flashcards
      await tx.flashcard.deleteMany({
        where: { materialId: pdf.id },
      });

      // Delete the course material (includes fileData)
      await tx.courseMaterial.delete({
        where: { id: pdf.id },
      });
    }

    // Delete the course selection
    await tx.studentCourseSelection.delete({
      where: {
        studentProfileId_curriculumCourseId: {
          studentProfileId: profile.id,
          curriculumCourseId,
        },
      },
    });
  });

  // Count remaining selections
  const remainingSelections = await prisma.studentCourseSelection.count({
    where: { studentProfileId: profile.id },
  });

  return {
    droppedCourse: {
      courseCode: selection.curriculumCourse.courseCode,
      title: selection.curriculumCourse.course.title,
    },
    deletedPDFs: deletedPDFCount,
    remainingSelections,
  };
}

/**
 * Get all catalog courses for the student's curriculum/year/semester,
 * flagged with whether the student has already selected each one.
 */
export const getAvailableCourses = async (
  studentId,
  searchQuery = null,
  filters = {},
) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { studentId },
  });

  if (!profile) {
    throw new AppError(
      "Please complete your academic profile setup first. Go to the onboarding page to select your university, department, and courses",
      400,
    );
  }

  // Only scope by curriculum — a student can browse/select courses from
  // any year or semester within their department's curriculum.
  const courseFilter = {
    curriculumId: profile.curriculumId,
  };

  // Optional explicit year/semester filters (e.g. from a dropdown in the UI)
  if (filters.year) courseFilter.year = filters.year;
  if (filters.semester) courseFilter.semester = filters.semester;

  if (searchQuery && searchQuery.trim()) {
    courseFilter.OR = [
      {
        course: {
          title: { contains: searchQuery.trim(), mode: "insensitive" },
        },
      },
      {
        courseCode: { contains: searchQuery.trim(), mode: "insensitive" },
      },
    ];
  }

  const curriculumCourses = await prisma.curriculumCourse.findMany({
    where: courseFilter,
    include: {
      course: {
        select: { id: true, title: true, description: true },
      },
    },
    orderBy: [{ year: "asc" }, { semester: "asc" }, { courseCode: "asc" }],
  });

  const selections = await prisma.studentCourseSelection.findMany({
    where: { studentProfileId: profile.id },
    select: { curriculumCourseId: true },
  });
  const selectedIds = new Set(selections.map((s) => s.curriculumCourseId));

  return curriculumCourses.map((cc) => ({
    id: cc.id,
    courseId: cc.course.id,
    code: cc.courseCode,
    name: cc.course.title,
    description: cc.course.description,
    creditHours: cc.creditHours,
    year: cc.year,
    semester: cc.semester,
    isEnrolled: selectedIds.has(cc.id),
  }));
};
