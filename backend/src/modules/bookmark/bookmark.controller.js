import * as bookmarkService from "./bookmark.service.js";
import { validateCreateBookmark, validateUpdateBookmark } from "./bookmark.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// ────────────────────────────────────────────────────────────────────
// CREATE BOOKMARK
// ────────────────────────────────────────────────────────────────────
export const createBookmark = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const { name, pageNumber, textSelection, color, note } = req.body;

    validateCreateBookmark({ name, pageNumber, textSelection, color, note });

    const bookmark = await bookmarkService.createBookmark(req.studentId, materialId, {
        name,
        pageNumber,
        textSelection,
        color,
        note,
    });

    res.status(201).json({
        success: true,
        message: "Bookmark created successfully",
        data: bookmark,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET BOOKMARKS FOR MATERIAL
// ────────────────────────────────────────────────────────────────────
export const getBookmarksForMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    const bookmarks = await bookmarkService.getBookmarksForMaterial(req.studentId, materialId);

    res.status(200).json({
        success: true,
        data: bookmarks,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET ALL BOOKMARKS
// ────────────────────────────────────────────────────────────────────
export const getAllBookmarks = asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;

    const result = await bookmarkService.getAllBookmarks(req.studentId, {
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
    });

    res.status(200).json({
        success: true,
        data: result,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET BOOKMARK BY ID
// ────────────────────────────────────────────────────────────────────
export const getBookmarkById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bookmark = await bookmarkService.getBookmarkById(req.studentId, id);

    res.status(200).json({
        success: true,
        data: bookmark,
    });
});

// ────────────────────────────────────────────────────────────────────
// UPDATE BOOKMARK
// ────────────────────────────────────────────────────────────────────
export const updateBookmark = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, note } = req.body;

    validateUpdateBookmark({ name, note });

    const bookmark = await bookmarkService.updateBookmark(req.studentId, id, { name, note });

    res.status(200).json({
        success: true,
        message: "Bookmark updated successfully",
        data: bookmark,
    });
});

// ────────────────────────────────────────────────────────────────────
// DELETE BOOKMARK
// ────────────────────────────────────────────────────────────────────
export const deleteBookmark = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await bookmarkService.deleteBookmark(req.studentId, id);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});
