import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  SUBSCRIPTION_LIMITS,
  canUploadMore,
} from "../../lib/subscriptionLimits.js";

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD PDF
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadPDF(studentId, curriculumCourseId, file) {
  // 1. Validate required inputs
  if (!curriculumCourseId) {
    throw new AppError("Please select a course before uploading", 400);
  }

  if (!file) {
    throw new AppError("Please select a PDF file", 400);
  }

  // 2. Make sure the uploaded file is a PDF
  if (file.mimetype !== "application/pdf") {
    throw new AppError("Only PDF files are allowed", 400);
  }

  // 3. Get student's subscription plan
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      subscriptionPlan: true,
    },
  });

  if (!student) {
    throw new AppError(
      "Account not found. Please log in again",
      404
    );
  }

  // 4. Check upload limit for the last 24 hours
  //    Deleted PDFs are also counted because we do not filter by status.
  const last24Hours = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  );

  const uploadedInLast24h = await prisma.courseMaterial.count({
    where: {
      uploadedBy: studentId,
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  if (
    !canUploadMore(
      student.subscriptionPlan,
      uploadedInLast24h
    )
  ) {
    const limit =
      SUBSCRIPTION_LIMITS[student.subscriptionPlan];

    throw new AppError(
      `You've reached your daily upload limit. Your ${student.subscriptionPlan} plan allows ${limit} PDF uploads per day. Try again tomorrow or upgrade your plan`,
      403
    );
  }

  // 5. Make sure onboarding/profile is completed
  const profile = await prisma.studentProfile.findUnique({
    where: {
      studentId,
    },
    select: {
      curriculumId: true,
    },
  });

  if (!profile) {
    throw new AppError(
      "Please complete your profile setup before uploading PDFs",
      400
    );
  }

  // 6. Verify that the curriculum course exists and belongs to student's curriculum
  const curriculumCourse = await prisma.curriculumCourse.findFirst({
    where: {
      id: curriculumCourseId,
      curriculumId: profile.curriculumId,
    },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!curriculumCourse) {
    throw new AppError(
      "This course is not part of your curriculum",
      403
    );
  }

  // 7. Save PDF
  //    file.buffer is stored as Bytes in PostgreSQL.
  const pdf = await prisma.courseMaterial.create({
    data: {
      curriculumCourseId,
      title: file.originalname,
      fileData: file.buffer,
      fileSize: file.size,
      uploadedBy: studentId,
      status: "READY",
    },
    select: {
      id: true,
      title: true,
      fileSize: true,
      createdAt: true,
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
  });

  // 8. Return metadata only
  return {
    id: pdf.id,
    fileName: pdf.title,
    fileSize: pdf.fileSize,
    uploadDate: pdf.createdAt,
    curriculumCourseId: pdf.curriculumCourse.id,
    courseId: pdf.curriculumCourse.course.id,
    courseName: pdf.curriculumCourse.course.title,
    progress: pdf.progress,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST STUDENT PDFs
// ─────────────────────────────────────────────────────────────────────────────

export async function getStudentPDFs(studentId) {
  // Never return fileData when listing PDFs.
  const pdfs = await prisma.courseMaterial.findMany({
    where: {
      uploadedBy: studentId,
      status: "READY",
    },

    select: {
      id: true,
      title: true,
      fileSize: true,
      createdAt: true,
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

    orderBy: {
      createdAt: "desc",
    },
  });

  // Group PDFs by curriculum course
  const grouped = {};

  for (const pdf of pdfs) {
    const curriculumCourseId = pdf.curriculumCourse.id;

    if (!grouped[curriculumCourseId]) {
      grouped[curriculumCourseId] = {
        curriculumCourseId: pdf.curriculumCourse.id,
        courseId: pdf.curriculumCourse.course.id,
        courseName: pdf.curriculumCourse.course.title,
        pdfs: [],
      };
    }

    grouped[curriculumCourseId].pdfs.push({
      id: pdf.id,
      fileName: pdf.title,
      fileSize: pdf.fileSize,
      uploadDate: pdf.createdAt,
      progress: pdf.progress,
    });
  }

  return grouped;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET PDF FILE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPDFFile(studentId, pdfId) {
  const pdf = await prisma.courseMaterial.findFirst({
    where: {
      id: pdfId,
      uploadedBy: studentId,
      status: "READY",
    },

    select: {
      title: true,
      fileData: true,
      progress: true,
    },
  });

  if (!pdf) {
    throw new AppError("PDF file not found", 404);
  }

  if (!pdf.fileData) {
    throw new AppError(
      "PDF content is not available",
      404
    );
  }

  return {
    fileName: pdf.title,
    buffer: pdf.fileData,
    progress: pdf.progress,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PDF READING PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateReadProgress(
  studentId,
  pdfId,
  progressPercentage
) {
  // Validate progress
  if (
    typeof progressPercentage !== "number" ||
    !Number.isFinite(progressPercentage) ||
    progressPercentage < 0 ||
    progressPercentage > 100
  ) {
    throw new AppError(
      "Progress must be between 0 and 100",
      400
    );
  }

  // Verify ownership
  const pdf = await prisma.courseMaterial.findFirst({
    where: {
      id: pdfId,
      uploadedBy: studentId,
      status: "READY",
    },

    select: {
      id: true,
      progress: true,
    },
  });

  if (!pdf) {
    throw new AppError("PDF file not found", 404);
  }

  // Progress can only move forward
  const newProgress = Math.max(
    pdf.progress,
    progressPercentage
  );

  const updated = await prisma.courseMaterial.update({
    where: {
      id: pdfId,
    },

    data: {
      progress: newProgress,
    },

    select: {
      progress: true,
    },
  });

  return {
    progress: updated.progress,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PDF
// ─────────────────────────────────────────────────────────────────────────────

export async function deletePDF(studentId, pdfId) {
  // Verify ownership and make sure it hasn't already been deleted
  const pdf = await prisma.courseMaterial.findFirst({
    where: {
      id: pdfId,
      uploadedBy: studentId,
      status: "READY",
    },

    select: {
      id: true,
    },
  });

  if (!pdf) {
    throw new AppError(
      "PDF file not found or already deleted",
      404
    );
  }

  // Soft delete:
  // - Remove the binary data
  // - Keep the record
  // - Mark status as DELETED
  //
  // This means the upload still counts toward
  // the 24-hour upload quota.
  await prisma.courseMaterial.update({
    where: {
      id: pdfId,
    },

    data: {
      status: "DELETED",
      fileData: null,
    },
  });

  return {
    message: "PDF deleted successfully",
  };
}