import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  SUBSCRIPTION_LIMITS,
  canUploadMore,
} from "../../lib/subscriptionLimits.js";
import { processMaterialAsync } from "../ai/materialProcessing.service.js";
import { uploadPDFToStorage, downloadPDFFromStorage, deletePDFFromStorage } from "../../lib/supabase.js";

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD PDF
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadPDF(studentId, curriculumCourseId, file) {
  // 1. Validate required inputs
  if (!studentId) {
    throw new AppError("Student account is required", 400);
  }

  if (!curriculumCourseId) {
    throw new AppError("Please select a course before uploading", 400);
  }

  if (!file) {
    throw new AppError("Please select a PDF file", 400);
  }

  // 2. Validate PDF
  if (file.mimetype !== "application/pdf") {
    throw new AppError("Only PDF files are allowed", 400);
  }

  if (!file.originalname) {
    throw new AppError("The uploaded PDF has no filename", 400);
  }

  if (!file.buffer) {
    throw new AppError("The uploaded PDF has no file data", 400);
  }

  if (!Buffer.isBuffer(file.buffer)) {
    throw new AppError("Invalid PDF file data", 400);
  }

  if (!Number.isInteger(file.size) || file.size <= 0) {
    throw new AppError("The uploaded PDF has an invalid file size", 400);
  }

  // 3. Get student's subscription plan
  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    select: {
      subscriptionPlan: true,
    },
  });

  if (!student) {
    throw new AppError("Account not found. Please log in again", 404);
  }

  // 4. Check upload limit for the last 24 hours
  // Deleted PDFs are also counted because we don't filter by status.
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const uploadedInLast24h = await prisma.courseMaterial.count({
    where: {
      uploadedBy: studentId,
      createdAt: {
        gte: last24Hours,
      },
    },
  });

  if (!canUploadMore(student.subscriptionPlan, uploadedInLast24h)) {
    const limit = SUBSCRIPTION_LIMITS[student.subscriptionPlan];

    throw new AppError(
      `You've reached your daily upload limit. Your ${student.subscriptionPlan} plan allows ${limit} PDF uploads per day. Try again tomorrow or upgrade your plan`,
      403,
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
      400,
    );
  }

  if (!profile.curriculumId) {
    throw new AppError("Your profile is not connected to a curriculum", 400);
  }

  // 6. Verify that the curriculum course exists
  // and belongs to the student's curriculum.
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
    throw new AppError("This course is not part of your curriculum", 403);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. Save PDF (initially without storage path or file data)
  // ───────────────────────────────────────────────────────────────────────────

  let pdf;

  try {
    pdf = await prisma.courseMaterial.create({
      data: {
        curriculumCourse: {
          connect: {
            id: curriculumCourseId,
          },
        },

        title: file.originalname,
        fileData: null, // Keep fileData null to save DB space
        fileSize: file.size,
        uploadedBy: studentId,
        status: "QUEUED", // Changed from READY - will be updated by processing
      },

      select: {
        id: true,
        title: true,
        fileSize: true,
        createdAt: true,
        progress: true,
        status: true,

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
  } catch (error) {
    throw error;
  }

  // 8. Upload to Supabase Storage and Update DB with path
  const storagePath = `${studentId}/${pdf.id}/${file.originalname}`;

  try {
    await uploadPDFToStorage(storagePath, file.buffer, file.mimetype);
  } catch (uploadError) {
    console.error(`[Upload] Failed to upload PDF ${pdf.id} to Supabase:`, uploadError.message);
    // Cleanup DB record
    await prisma.courseMaterial.delete({ where: { id: pdf.id } }).catch((dbErr) => {
      console.error("[Upload] Failed to delete record after failed storage upload:", dbErr.message);
    });
    throw new AppError(`Failed to save PDF to storage: ${uploadError.message}`, 500);
  }

  try {
    await prisma.courseMaterial.update({
      where: { id: pdf.id },
      data: { storagePath },
    });
  } catch (dbUpdateError) {
    console.error(`[Upload] Failed to update storagePath in DB for ${pdf.id}:`, dbUpdateError.message);
    // Cleanup storage file and DB record
    await deletePDFFromStorage(storagePath);
    await prisma.courseMaterial.delete({ where: { id: pdf.id } }).catch((dbErr) => {
      console.error("[Upload] Failed to delete record after failed db update:", dbErr.message);
    });
    throw new AppError("Failed to save storage path in database", 500);
  }

  // 9. Start background processing (non-blocking)
  console.log(`[Upload] Starting background processing for material ${pdf.id}`);
  processMaterialAsync(pdf.id);

  // 10. Return metadata only
  return {
    id: pdf.id,
    fileName: pdf.title,
    fileSize: pdf.fileSize,
    uploadDate: pdf.createdAt,
    curriculumCourseId: pdf.curriculumCourse.id,
    courseId: pdf.curriculumCourse.course.id,
    courseName: pdf.curriculumCourse.course.title,
    progress: pdf.progress,
    status: pdf.status,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST STUDENT PDFs
// ─────────────────────────────────────────────────────────────────────────────

export async function getStudentPDFs(studentId) {
  if (!studentId) {
    throw new AppError("Student account is required", 400);
  }

  // Find the student's currently active course selections
  const selections = await prisma.studentCourseSelection.findMany({
    where: {
      studentProfile: {
        studentId,
      },
    },
    select: {
      curriculumCourseId: true,
    },
  });

  const activeCurriculumCourseIds = selections.map((s) => s.curriculumCourseId);

  if (activeCurriculumCourseIds.length === 0) {
    return {};
  }

  // Return all materials for active courses (including processing ones), but never include fileData
  const pdfs = await prisma.courseMaterial.findMany({
    where: {
      uploadedBy: studentId,
      curriculumCourseId: {
        in: activeCurriculumCourseIds,
      },
      status: {
        not: "DELETED", // Exclude deleted materials
      },
    },

    select: {
      id: true,
      title: true,
      fileSize: true,
      createdAt: true,
      progress: true,
      status: true, // Include status so frontend can show processing state

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
      status: pdf.status,
    });
  }

  return grouped;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET PDF FILE
// ─────────────────────────────────────────────────────────────────────────────

export async function getPDFFile(studentId, pdfId) {
  if (!studentId) {
    throw new AppError("Student account is required", 400);
  }

  if (!pdfId) {
    throw new AppError("PDF ID is required", 400);
  }

  const pdf = await prisma.courseMaterial.findFirst({
    where: {
      id: pdfId,
      uploadedBy: studentId,
      status: "READY",
    },

    select: {
      title: true,
      fileData: true,
      storagePath: true,
      progress: true,
    },
  });

  if (!pdf) {
    throw new AppError("PDF file not found", 404);
  }

  let buffer;
  if (pdf.storagePath) {
    try {
      buffer = await downloadPDFFromStorage(pdf.storagePath);
    } catch (err) {
      console.error(`[PDF Service] Failed to download PDF from storage for ${pdfId}:`, err.message);
      throw new AppError("Failed to retrieve PDF file from storage", 500);
    }
  } else if (pdf.fileData) {
    buffer = pdf.fileData;
  } else {
    throw new AppError("PDF content is not available", 404);
  }

  return {
    fileName: pdf.title,
    buffer,
    progress: pdf.progress,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PDF READING PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateReadProgress(studentId, pdfId, progressPercentage) {
  if (!studentId) {
    throw new AppError("Student account is required", 400);
  }

  if (!pdfId) {
    throw new AppError("PDF ID is required", 400);
  }

  // Validate progress
  if (
    typeof progressPercentage !== "number" ||
    !Number.isFinite(progressPercentage) ||
    progressPercentage < 0 ||
    progressPercentage > 100
  ) {
    throw new AppError("Progress must be between 0 and 100", 400);
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
  const newProgress = Math.max(pdf.progress, progressPercentage);

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
  if (!studentId) {
    throw new AppError("Student account is required", 400);
  }

  if (!pdfId) {
    throw new AppError("PDF ID is required", 400);
  }

  // Verify ownership and make sure it hasn't already been deleted
  const pdf = await prisma.courseMaterial.findFirst({
    where: {
      id: pdfId,
      uploadedBy: studentId,
      status: { not: "DELETED" },
    },

    select: {
      id: true,
      storagePath: true,
    },
  });

  if (!pdf) {
    throw new AppError("PDF file not found or already deleted", 404);
  }

  // Soft delete:
  // - Remove the binary data and path
  // - Keep the record
  // - Mark status as DELETED
  //
  // This means the upload still counts
  // toward the 24-hour upload quota.
  await prisma.courseMaterial.update({
    where: {
      id: pdfId,
    },

    data: {
      status: "DELETED",
      fileData: null,
      storagePath: null,
    },
  });

  // Clean up Supabase storage file asynchronously
  if (pdf.storagePath) {
    deletePDFFromStorage(pdf.storagePath).catch((err) => {
      console.error(`[PDF Service] Failed to delete file ${pdf.storagePath} from Supabase:`, err.message);
    });
  }

  return {
    message: "PDF deleted successfully",
  };
}
