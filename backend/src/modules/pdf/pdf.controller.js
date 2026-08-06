import * as pdfService from "./pdf.service.js";
import { validatePDFUpload } from "./pdf.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const uploadPDF = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const file = req.file;

  validatePDFUpload(file, courseId);

  const result = await pdfService.uploadPDF(req.studentId, courseId, file);

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
  const { fileName, buffer } = await pdfService.getPDFFile(req.studentId, id);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
    "Content-Length": buffer.length,
  });

  res.send(buffer);
});

export const deletePDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pdfService.deletePDF(req.studentId, id);

  res.status(200).json({ success: true, message: "PDF deleted successfully" });
});
