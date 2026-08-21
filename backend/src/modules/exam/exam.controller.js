import { asyncHandler } from "../../utils/asyncHandler.js";
import * as examService from "./exam.service.js";

/**
 * POST /admin/exams - Upload past exam
 */
export const uploadExam = asyncHandler(async (req, res) => {
  const { curriculumCourseId, examYear, examType } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const exam = await examService.uploadPastExam(
    file,
    curriculumCourseId,
    examYear,
    examType,
    req.studentId // Assuming admin is also a student with admin role
  );

  res.status(201).json({
    success: true,
    message: "Exam uploaded and processing started",
    data: exam,
  });
});

/**
 * GET /admin/exams/:id - Get exam for review
 */
export const getExamForReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exam = await examService.getExamForReview(id);

  res.status(200).json({
    success: true,
    data: exam,
  });
});

/**
 * PATCH /admin/exams/questions/:questionId - Update question
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const updates = req.body;

  const question = await examService.updateQuestion(questionId, updates);

  res.status(200).json({
    success: true,
    message: "Question updated",
    data: question,
  });
});

/**
 * POST /admin/exams/:id/finalize - Mark exam as READY
 */
export const finalizeExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exam = await examService.finalizeExam(id);

  res.status(200).json({
    success: true,
    message: "Exam finalized and ready for students",
    data: exam,
  });
});

/**
 * GET /student/exams/questions - Get verified questions for practice
 */
export const getPracticeQuestions = asyncHandler(async (req, res) => {
  const { curriculumCourseId } = req.query;
  const filters = {
    topic: req.query.topic,
    questionType: req.query.questionType,
    limit: req.query.limit ? parseInt(req.query.limit) : 50,
  };

  const questions = await examService.getStudentPracticeQuestions(
    curriculumCourseId,
    filters
  );

  res.status(200).json({
    success: true,
    data: questions,
  });
});

/**
 * POST /student/exams/evaluate - Evaluate student answer
 */
export const evaluateAnswer = asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;

  const result = await examService.evaluateAnswer(questionId, answer);

  res.status(200).json({
    success: true,
    data: result,
  });
});
