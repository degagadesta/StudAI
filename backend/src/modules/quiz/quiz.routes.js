import { Router } from "express";
import { generateQuiz, submitAttempt, getHistory } from "./quiz.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/generate", authenticate, generateQuiz);
router.post("/:quizId/attempt", authenticate, submitAttempt);
router.get("/history/:materialId", authenticate, getHistory);

export default router;
