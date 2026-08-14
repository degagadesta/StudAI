import * as noteService from "./note.service.js";
import { validateNoteContent, validateUUID } from "./note.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * GET /api/v1/student/materials/:materialId/note
 * Get the note for a specific material
 */
export const getNote = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(materialId, "materialId");

    // Fetch note
    const note = await noteService.getNote(studentId, materialId);

    // Return null if note doesn't exist (valid state, not an error)
    res.status(200).json({
        success: true,
        data: note,
    });
});

/**
 * PUT /api/v1/student/materials/:materialId/note
 * Create or update a note (upsert)
 */
export const upsertNote = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(materialId, "materialId");

    // Validate request body
    validateNoteContent(req.body);

    // Upsert note
    const note = await noteService.upsertNote(
        studentId,
        materialId,
        req.body.content
    );

    // If content was empty (triggering delete), return 204 No Content
    if (!note) {
        return res.status(204).send();
    }

    // Return the saved note
    res.status(200).json({
        success: true,
        data: note,
    });
});

/**
 * DELETE /api/v1/student/materials/:materialId/note
 * Delete a note
 */
export const deleteNote = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const studentId = req.studentId;

    // Validate UUID
    validateUUID(materialId, "materialId");

    // Delete note
    await noteService.deleteNote(studentId, materialId);

    // Return 204 No Content (success, no response body)
    res.status(204).send();
});
