import { asyncHandler } from "../../utils/asyncHandler.js";
import * as quizService from "./quiz.service.js";

/**
 * POST /student/quizzes/generate
 */
export const generateQuiz = asyncHandler(async (req, res) => {
  const { materialId, difficulty, count } = req.body;
  const studentId = req.studentId;

  if (!materialId || !difficulty) {
    return res.status(400).json({
      success: false,
      message: "materialId and difficulty are required",
    });
  }

  const quiz = await quizService.generateQuizFromMaterial(
    materialId,
    difficulty,
    count ? parseInt(count) : 5,
    studentId
  );

  res.status(201).json({
    success: true,
    data: quiz,
  });
});

/**
 * POST /student/quizzes/:quizId/attempt
 */
export const submitAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  const studentId = req.studentId;

  if (!answers) {
    return res.status(400).json({
      success: false,
      message: "answers are required",
    });
  }

  const result = await quizService.evaluateQuizAttempt(quizId, answers, studentId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /student/quizzes/history/:materialId
 */
export const getHistory = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const studentId = req.studentId;

  if (!materialId) {
    return res.status(400).json({
      success: false,
      message: "materialId is required",
    });
  }

  const history = await quizService.getQuizHistory(materialId, studentId);

  res.status(200).json({
    success: true,
    data: history,
  });
});
