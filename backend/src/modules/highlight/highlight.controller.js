import * as highlightService from "./highlight.service.js";
import {
    validateCreateHighlight,
    validateUpdateHighlight,
    validateUUID,
} from "./highlight.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * POST /api/v1/student/materials/:materialId/highlights
 * Create a new highlight for a material
 */
export const createHighlight = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(materialId, "materialId");

    // Validate request body
    validateCreateHighlight(req.body);

    // Create highlight
    const highlight = await highlightService.createHighlight(
        studentId,
        materialId,
        req.body
    );

    res.status(201).json({
        success: true,
        data: highlight,
    });
});

/**
 * GET /api/v1/student/materials/:materialId/highlights
 * Get all highlights for a material (for authenticated student)
 */
export const getHighlights = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(materialId, "materialId");

    // Fetch highlights
    const highlights = await highlightService.getHighlights(
        studentId,
        materialId
    );

    res.status(200).json({
        success: true,
        data: highlights,
    });
});

/**
 * PATCH /api/v1/student/highlights/:highlightId
 * Update a highlight (color and/or note)
 */
export const updateHighlight = asyncHandler(async (req, res) => {
    const { highlightId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(highlightId, "highlightId");

    // Validate request body
    validateUpdateHighlight(req.body);

    // Update highlight
    const highlight = await highlightService.updateHighlight(
        studentId,
        highlightId,
        req.body
    );

    res.status(200).json({
        success: true,
        data: highlight,
    });
});

/**
 * DELETE /api/v1/student/highlights/:highlightId
 * Delete a highlight
 */
export const deleteHighlight = asyncHandler(async (req, res) => {
    const { highlightId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(highlightId, "highlightId");

    // Delete highlight
    await highlightService.deleteHighlight(studentId, highlightId);

    res.status(204).send();
});


