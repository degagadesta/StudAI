import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
    createHighlight,
    getHighlights,
    updateHighlight,
    deleteHighlight,
} from "./highlight.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Material-specific highlight routes
router.post("/materials/:materialId/highlights", createHighlight);
router.get("/materials/:materialId/highlights", getHighlights);


router.patch("/highlights/:highlightId", updateHighlight);
router.delete("/highlights/:highlightId", deleteHighlight);

export default router;
