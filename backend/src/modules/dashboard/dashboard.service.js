import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

// Get student name for welcome greeting
export async function getDashboardData(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { firstName: true },
  });

  if (!student) throw new AppError("Account not found. Please log in again", 404);

  return {
    student: {
      name: student.firstName,
    },
  };
}

// Get paginated PDFs with optional search
export async function getDashboardPDFs(studentId, { limit = 3, offset = 0, search = null }) {
  // Build query conditions
  const where = {
    uploadedBy: studentId,
    status: "READY",
  };

  // Add search filter if provided - search in both title and course name
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        curriculumCourse: {
          course: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      },
    ];
  }

  // Get paginated PDFs with course info
  const pdfs = await prisma.courseMaterial.findMany({
    where,
    select: {
      id: true,
      title: true,
      progress: true,
      curriculumCourse: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  // Get total count for metadata
  const total = await prisma.courseMaterial.count({ where });

  // Transform response to include course info
  const transformedPdfs = pdfs.map(pdf => ({
    id: pdf.id,
    title: pdf.title,
    progress: pdf.progress,
    curriculumCourseId: pdf.curriculumCourse.id,
    courseId: pdf.curriculumCourse.course.id,
    courseName: pdf.curriculumCourse.course.title,
  }));

  return {
    pdfs: transformedPdfs,
    total,
    hasMore: offset + pdfs.length < total,
  };
}
