import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { SUBSCRIPTION_LIMITS, canUploadMore } from "../../lib/subscriptionLimits.js";

// ─── upload ──────────────────────────────────────────────────────────────────

export async function uploadPDF(studentId, courseId, file) {
  // 1. Get student subscription plan
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });
  if (!student) throw new AppError("Student not found", 404);

  // 2. 24-hour upload window limit
  //    Count ALL uploads in the last 24 hours regardless of status (deleted or not).
  //    Even if the user deletes a PDF, it still counts toward today's quota.
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const uploadedInLast24h = await prisma.courseMaterial.count({
    where: {
      uploadedBy: studentId,
      createdAt: { gte: last24Hours },
    },
  });

  if (!canUploadMore(student.subscriptionPlan, uploadedInLast24h)) {
    const limit = SUBSCRIPTION_LIMITS[student.subscriptionPlan];
    throw new AppError(
      `Daily upload limit reached. Your ${student.subscriptionPlan} plan allows ${limit} PDF uploads per 24 hours`,
      403
    );
  }

  // 3. Require completed onboarding
  const profile = await prisma.studentProfile.findUnique({ where: { studentId } });
  if (!profile) throw new AppError("Please complete onboarding first", 400);

  // 4. Verify the course belongs to the student's curriculum
  const courseAccess = await prisma.curriculumCourse.findFirst({
    where: { curriculumId: profile.curriculumId, courseId },
  });
  if (!courseAccess) throw new AppError("You don't have access to this course", 403);

  // 5. Store file binary directly in the database (no disk I/O)
  const pdf = await prisma.courseMaterial.create({
    data: {
      courseId,
      title: file.originalname,
      fileData: file.buffer,   // Buffer stored as Bytes in PostgreSQL
      fileSize: file.size,
      uploadedBy: studentId,
      status: "READY",
    },
    include: { course: { select: { id: true, title: true } } },
  });

  return {
    id: pdf.id,
    fileName: pdf.title,
    fileSize: pdf.fileSize,
    uploadDate: pdf.createdAt,
    courseId: pdf.course.id,
    courseName: pdf.course.title,
  };
}

// ─── list ─────────────────────────────────────────────────────────────────────

export async function getStudentPDFs(studentId) {
  // Never return fileData in the list — only metadata
  const pdfs = await prisma.courseMaterial.findMany({
    where: { uploadedBy: studentId, status: "READY" },
    select: {
      id: true,
      title: true,
      fileSize: true,
      createdAt: true,
      course: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by course name
  const grouped = {};
  for (const pdf of pdfs) {
    const key = pdf.course.title;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: pdf.id,
      fileName: pdf.title,
      fileSize: pdf.fileSize,
      uploadDate: pdf.createdAt,
      courseId: pdf.course.id,
      courseName: key,
    });
  }

  return grouped;
}

// ─── serve file ───────────────────────────────────────────────────────────────

export async function getPDFFile(studentId, pdfId) {
  const pdf = await prisma.courseMaterial.findFirst({
    where: { id: pdfId, uploadedBy: studentId, status: "READY" },
    select: { title: true, fileData: true },
  });

  if (!pdf) throw new AppError("PDF not found", 404);
  if (!pdf.fileData) throw new AppError("File data not available", 404);

  return { fileName: pdf.title, buffer: pdf.fileData };
}

// ─── delete ───────────────────────────────────────────────────────────────────

export async function deletePDF(studentId, pdfId) {
  const pdf = await prisma.courseMaterial.findFirst({
    where: { id: pdfId, uploadedBy: studentId, status: "READY" },
    select: { id: true },
  });
  if (!pdf) throw new AppError("PDF not found or already deleted", 404);

  // Soft-delete: clear binary data to free DB space, mark as DELETED
  await prisma.courseMaterial.update({
    where: { id: pdfId },
    data: { status: "DELETED", fileData: null },
  });

  return { message: "PDF deleted successfully" };
}
