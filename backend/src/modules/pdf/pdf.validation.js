import { AppError } from "../../utils/AppError.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

export function validatePDFUpload(file, courseId) {
    if (!file) {
        throw new AppError("No file uploaded", 400);
    }

    if (!courseId) {
        throw new AppError("Course ID is required", 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new AppError("Only PDF files are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new AppError("File size exceeds 20MB limit", 400);
    }
}
