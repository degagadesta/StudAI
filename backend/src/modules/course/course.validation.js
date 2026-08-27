import { AppError } from "../../utils/AppError.js";

/**
 * Validate course selection input
 */
export function validateCourseSelection({ curriculumCourseId }) {
    const errors = [];

    if (!curriculumCourseId || typeof curriculumCourseId !== "string") {
        errors.push("Course ID is required");
    } else if (curriculumCourseId.trim().length === 0) {
        errors.push("Course ID cannot be empty");
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}
