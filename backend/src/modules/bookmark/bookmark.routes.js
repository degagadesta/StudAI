import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
    createBookmark,
    getBookmarksForMaterial,
    getAllBookmarks,
    getBookmarkById,
    updateBookmark,
    deleteBookmark,
} from "./bookmark.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Material-specific bookmarks
router.post("/materials/:materialId/bookmarks", createBookmark);
router.get("/materials/:materialId/bookmarks", getBookmarksForMaterial);

// All bookmarks
router.get("/bookmarks", getAllBookmarks);
router.get("/bookmarks/:id", getBookmarkById);
router.patch("/bookmarks/:id", updateBookmark);
router.delete("/bookmarks/:id", deleteBookmark);

export default router;
