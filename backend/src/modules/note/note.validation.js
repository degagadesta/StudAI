import { AppError } from "../../utils/AppError.js";

const MAX_CONTENT_LENGTH = 100000; // 100,000 characters (~50 pages of text)

/**
 * Validate note content for upsert operation
 */
export function validateNoteContent(data) {
    const errors = [];

    // Check if content field exists
    if (data.content === undefined) {
        errors.push("content field is required");
    }

    // Check if content is a string
    if (typeof data.content !== "string") {
        errors.push("content must be a string");
    }

    // Check content length (allow empty string - it will trigger delete)
    if (data.content && data.content.length > MAX_CONTENT_LENGTH) {
        errors.push(
            `content cannot exceed ${MAX_CONTENT_LENGTH} characters`
        );
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
