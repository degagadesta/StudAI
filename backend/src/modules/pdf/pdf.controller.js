import * as pdfService from "./pdf.service.js";
import { validatePDFUpload } from "./pdf.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { invalidateMaterials } from "../../utils/cacheInvalidation.js";

export const uploadPDF = asyncHandler(async (req, res) => {
  const { curriculumCourseId } = req.body;
  const file = req.file;

  validatePDFUpload(file, curriculumCourseId);

  const result = await pdfService.uploadPDF(req.studentId, curriculumCourseId, file);

  // Invalidate materials cache after upload
  await invalidateMaterials(req.studentId);

  res.status(201).json({
    success: true,
    message: "PDF uploaded successfully",
    data: result,
  });
});

export const getPDFs = asyncHandler(async (req, res) => {
  const pdfs = await pdfService.getStudentPDFs(req.studentId);

  res.status(200).json({ success: true, data: pdfs });
});

// Streams the raw PDF binary back to the client
export const servePDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const etag = `W/"pdf-${id}"`;

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }

  const { fileName, buffer, progress } = await pdfService.getPDFFile(req.studentId, id);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
    "Content-Length": buffer.length,
    "X-Progress": progress.toString(),
    "Cache-Control": "private, max-age=86400, stale-while-revalidate=3600",
    "ETag": etag,
  });

  res.send(buffer);
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  const result = await pdfService.updateReadProgress(
    req.studentId,
    id,
    progress
  );

  res.status(200).json({
    success: true,
    message: "Reading progress updated",
    data: result,
  });
});

export const deletePDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pdfService.deletePDF(req.studentId, id);

  // Invalidate materials cache after delete
  await invalidateMaterials(req.studentId, id);

  res.status(200).json({ success: true, message: "PDF deleted successfully" });
});
