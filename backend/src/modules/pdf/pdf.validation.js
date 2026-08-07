import { AppError } from "../../utils/AppError.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

export function validatePDFUpload(file, courseId) {
    if (!file) {
        throw new AppError("Please select a PDF file to upload", 400);
    }

    if (!courseId) {
        throw new AppError("Please select a course for this PDF", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new AppError("Only PDF files are supported. Please upload a PDF file", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new AppError("File is too large. Maximum size is 20MB", 400);
    }
}
