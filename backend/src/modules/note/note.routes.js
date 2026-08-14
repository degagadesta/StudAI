import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getNote, upsertNote, deleteNote } from "./note.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Note routes for a specific material
router.get("/materials/:materialId/note", getNote);
router.put("/materials/:materialId/note", upsertNote);
router.delete("/materials/:materialId/note", deleteNote);

export default router;
