import { AppError } from "../../utils/AppError.js";

export function validateStartSession({ courseId, materialId, type }) {
    const errors = [];

    // Type validation
    const validTypes = ["REGULAR", "POMODORO"];
    if (type && !validTypes.includes(type)) {
        errors.push(`Type must be one of: ${validTypes.join(", ")}`);
    }

    // At least one of courseId or materialId should be provided (optional constraint)
    // This allows tracking what they're studying

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}

export function validateEndSession({ duration }) {
    const errors = [];

    // Duration validation (in minutes)
    if (duration !== undefined) {
        if (typeof duration !== "number" || duration < 0) {
            errors.push("Duration must be a positive number");
        }
        if (duration > 480) {
            // Max 8 hours
            errors.push("Session duration cannot exceed 8 hours (480 minutes)");
        }
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}

export function validatePomodoroIncrement({ pomodoroCount }) {
    if (
        pomodoroCount !== undefined &&
        (typeof pomodoroCount !== "number" || pomodoroCount < 0 || pomodoroCount > 20)
    ) {
        throw new AppError("Pomodoro count must be between 0 and 20", 400);
    }
}
