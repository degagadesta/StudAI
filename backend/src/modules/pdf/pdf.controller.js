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
        data: result
    });
});

export const getPDFs = asyncHandler(async (req, res) => {
    const pdfs = await pdfService.getStudentPDFs(req.studentId);

    res.status(200).json({
        success: true,
        data: pdfs
    });
});

export const deletePDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await pdfService.deletePDF(req.studentId, id);

    res.status(200).json({
        success: true,
        message: "PDF deleted successfully"
    });
});
