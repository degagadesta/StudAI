import { AppError } from "../../utils/AppError.js";

/**
 * Validate basic profile information (name)
 */
/**
 * Validate profile update information.
 *
 * All fields are optional because the user can update
 * only the information they want to change.
 */
export function validateProfileUpdate({
    firstName,
    lastName,
    currentYear,
    currentSemester,
}) {
    const errors = [];

    // ============================================
    // Basic information
    // ============================================

    // Validate firstName only if provided
    if (firstName !== undefined) {
        if (typeof firstName !== "string") {
            errors.push("First name must be a string");
        } else {
            const trimmed = firstName.trim();

            if (trimmed.length < 2) {
                errors.push("First name must be at least 2 characters");
            } else if (trimmed.length > 50) {
                errors.push("First name must not exceed 50 characters");
            } else if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
                errors.push(
                    "First name can only contain letters, spaces, hyphens, and apostrophes"
                );
            }
        }
    }

    // Validate lastName only if provided
    if (lastName !== undefined) {
        if (typeof lastName !== "string") {
            errors.push("Last name must be a string");
        } else {
            const trimmed = lastName.trim();

            if (trimmed.length < 2) {
                errors.push("Last name must be at least 2 characters");
            } else if (trimmed.length > 50) {
                errors.push("Last name must not exceed 50 characters");
            } else if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
                errors.push(
                    "Last name can only contain letters, spaces, hyphens, and apostrophes"
                );
            }
        }
    }

    // ============================================
    // Academic information
    // ============================================

    // Validate currentYear only if provided
    if (currentYear !== undefined) {
        if (!Number.isInteger(currentYear)) {
            errors.push("Current year must be a whole number");
        } else if (currentYear < 1 || currentYear > 6) {
            errors.push("Current year must be between 1 and 6");
        }
    }

    // Validate currentSemester only if provided
    if (currentSemester !== undefined) {
        if (!Number.isInteger(currentSemester)) {
            errors.push("Current semester must be a whole number");
        } else if (currentSemester < 1 || currentSemester > 2) {
            errors.push("Current semester must be either 1 or 2");
        }
    }

    // ============================================
    // Final validation
    // ============================================

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}
/**
 * Validate account deletion request
 */
export function validateAccountDeletion({ password, confirmDelete }) {
    const errors = [];

    // Confirmation check
    if (confirmDelete !== true) {
        errors.push("Please confirm account deletion by setting confirmDelete to true");
    }

    // Password validation (optional for Google users, will be checked in service)
    if (password !== undefined && password !== null) {
        if (typeof password !== "string" || password.length < 8) {
            errors.push("Password must be at least 8 characters");
        }
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}
