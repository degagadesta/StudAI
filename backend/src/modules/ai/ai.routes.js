import { Router } from "express";
import {
  generateSummary,
  generateFlashcards,
  askQuestion,
  generateExam,
  explainTopic,
  generateNotes,
  getChatSessions,
  getSessionMessages,
  deleteChatSession,
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
router.get("/chat/sessions/:curriculumCourseId", authenticate, getChatSessions);
router.get("/chat/sessions/:sessionId/messages", authenticate, getSessionMessages);
router.delete("/chat/sessions/:sessionId", authenticate, deleteChatSession);

router.post("/explain-topic", authenticate, explainTopic);
router.post(
  "/courses/:curriculumCourseId/materials/:materialId/exam",
  authenticate,
  generateExam,
);

router.post("/materials/:materialId/notes", authenticate, generateNotes);

export default router;
