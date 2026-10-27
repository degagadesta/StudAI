import { AppError } from "../../utils/AppError.js";

export function validateCreateBookmark({ name, pageNumber, textSelection, color, note }) {
    const errors = [];

    // Name validation
    if (!name || typeof name !== "string") {
        errors.push("Bookmark name is required");
    } else if (name.trim().length < 1 || name.trim().length > 100) {
        errors.push("Bookmark name must be between 1 and 100 characters");
    }

    // Page number validation
    if (pageNumber === undefined || pageNumber === null) {
        errors.push("Page number is required");
    } else if (typeof pageNumber !== "number" || pageNumber < 1) {
        errors.push("Page number must be a positive integer");
    }

    // Text selection validation (optional)
    if (textSelection !== undefined && textSelection !== null) {
        // Allow string format (simple selected text) or object format (with offsets)
        if (typeof textSelection === "string") {
            if (textSelection.length > 500) {
                errors.push("Selected text is too long (max 500 characters)");
            }
        } else if (typeof textSelection === "object") {
            if (
                typeof textSelection.startOffset !== "number" ||
                typeof textSelection.endOffset !== "number"
            ) {
                errors.push("Text selection must include startOffset and endOffset");
            }
            if (textSelection.startOffset < 0 || textSelection.endOffset < textSelection.startOffset) {
                errors.push("Invalid text selection offsets");
            }
            if (textSelection.selectedText && typeof textSelection.selectedText !== "string") {
                errors.push("Selected text must be a string");
            }
            if (textSelection.selectedText && textSelection.selectedText.length > 500) {
                errors.push("Selected text is too long (max 500 characters)");
            }
        } else {
            errors.push("Text selection must be a string or object");
        }
    }

    // Color validation (optional)
    const validColors = ["yellow", "green", "blue", "red", "purple", "orange"];
    if (color && !validColors.includes(color)) {
        errors.push(`Color must be one of: ${validColors.join(", ")}`);
    }

    // Note validation (optional)
    if (note && typeof note !== "string") {
        errors.push("Note must be a string");
    } else if (note && note.length > 1000) {
        errors.push("Note is too long (max 1000 characters)");
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}

export function validateUpdateBookmark({ name, note }) {
    const errors = [];

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
            errors.push("Bookmark name must be between 1 and 100 characters");
        }
    }

    if (note !== undefined && note !== null) {
        if (typeof note !== "string") {
            errors.push("Note must be a string");
        } else if (note.length > 1000) {
            errors.push("Note is too long (max 1000 characters)");
        }
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(". "), 400);
    }
}
