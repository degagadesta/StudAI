import { Router } from "express";
import multer from "multer";
import {
  uploadExam,
  getExamForReview,
  updateQuestion,
  finalizeExam,
  getPracticeQuestions,
  evaluateAnswer,
} from "./exam.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { AppError } from "../../utils/AppError.js";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Only PDF and image files are supported",
          400
        ),
        false
      );
    }
  },
});

/**
 * Admin Routes - Specific routes FIRST
 */
router.patch("/admin/exams/questions/:questionId", authenticate, updateQuestion);
router.post("/admin/exams/:id/finalize", authenticate, finalizeExam);
router.post("/admin/exams", authenticate, upload.single("file"), uploadExam);
router.get("/admin/exams/:id", authenticate, getExamForReview);

/**
 * Student Routes
 */
router.get("/student/exams/questions", authenticate, getPracticeQuestions);
router.post("/student/exams/evaluate", authenticate, evaluateAnswer);

export default router;
