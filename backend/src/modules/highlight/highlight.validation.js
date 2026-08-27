import { AppError } from "../../utils/AppError.js";

const ALLOWED_COLORS = ["yellow", "green", "blue", "pink", "orange"];
const MAX_TEXT_CONTENT_LENGTH = 5000;
const MAX_NOTE_LENGTH = 1000;

/**
 * Validate highlight creation data
 */
export function validateCreateHighlight(data) {
    const errors = [];

    // Validate pageNumber
    if (!data.pageNumber || typeof data.pageNumber !== "number") {
        errors.push("pageNumber is required and must be a number");
    } else if (data.pageNumber < 1) {
        errors.push("pageNumber must be at least 1");
    }

    // Validate textContent
    if (!data.textContent || typeof data.textContent !== "string") {
        errors.push("textContent is required and must be a string");
    } else if (data.textContent.trim().length === 0) {
        errors.push("textContent cannot be empty");
    } else if (data.textContent.length > MAX_TEXT_CONTENT_LENGTH) {
        errors.push(
            `textContent cannot exceed ${MAX_TEXT_CONTENT_LENGTH} characters`
        );
    }

    // Validate position
    if (!data.position || typeof data.position !== "object") {
        errors.push("position is required and must be an object");
    } else {
        // Validate position structure
        if (typeof data.position.startOffset !== "number") {
            errors.push("position.startOffset must be a number");
        }
        if (typeof data.position.endOffset !== "number") {
            errors.push("position.endOffset must be a number");
        }
        if (data.position.startOffset >= data.position.endOffset) {
            errors.push("position.startOffset must be less than endOffset");
        }
    }

    // Validate color
    if (data.color && !ALLOWED_COLORS.includes(data.color)) {
        errors.push(
            `color must be one of: ${ALLOWED_COLORS.join(", ")}`
        );
    }

    // Validate note (optional)
    if (data.note !== undefined && data.note !== null) {
        if (typeof data.note !== "string") {
            errors.push("note must be a string");
        } else if (data.note.length > MAX_NOTE_LENGTH) {
            errors.push(`note cannot exceed ${MAX_NOTE_LENGTH} characters`);
        }
    }

    if (errors.length > 0) {
        throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
    }
}

/**
 * Validate highlight update data
 */
export function validateUpdateHighlight(data) {
    const errors = [];

    // Validate color (if provided)
    if (data.color !== undefined) {
        if (!ALLOWED_COLORS.includes(data.color)) {
            errors.push(
                `color must be one of: ${ALLOWED_COLORS.join(", ")}`
            );
        }
    }

    // Validate note (if provided)
    if (data.note !== undefined && data.note !== null) {
        if (typeof data.note !== "string") {
            errors.push("note must be a string");
        } else if (data.note.length > MAX_NOTE_LENGTH) {
            errors.push(`note cannot exceed ${MAX_NOTE_LENGTH} characters`);
        }
    }

    // At least one field must be provided
    if (data.color === undefined && data.note === undefined) {
        errors.push("At least one field (color or note) must be provided");
    }

    if (errors.length > 0) {
        throw new AppError(`Validation failed: ${errors.join(", ")}`, 400);
    }
}

/**
 * Validate UUID format
 */
export function validateUUID(id, fieldName = "id") {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
        throw new AppError(`Invalid ${fieldName} format`, 400);
    }
}
