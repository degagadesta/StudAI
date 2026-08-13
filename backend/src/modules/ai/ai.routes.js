import { Router } from "express";
import {
  generateSummary,
  generateFlashcards,
  askQuestion,
  generateExam,
} from "./ai.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/materials/:materialId/summary", authenticate, generateSummary);
router.post(
  "/materials/:materialId/flashcards",
  authenticate,
  generateFlashcards,
);
router.post("/chat/ask", authenticate, askQuestion);
router.post(
  "/courses/:curriculumCourseId/materials/:materialId/exam",
  authenticate,
  generateExam,
);

export default router;
