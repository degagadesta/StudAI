import { asyncHandler } from "../../utils/asyncHandler.js";
import * as aiService from "./ai.service.js";

export const generateSummary = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const result = await aiService.generateSummary(materialId, req.studentId);
  res.status(200).json({ success: true, data: result });
});

export const generateFlashcards = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const { count } = req.body;
  const result = await aiService.generateFlashcards(
    materialId,
    req.studentId,
    count,
  );
  res.status(201).json({ success: true, data: result });
});

export const askQuestion = asyncHandler(async (req, res) => {
  const { curriculumCourseId, materialId, question } = req.body;
  const result = await aiService.askAboutMaterial(
    req.studentId,
    curriculumCourseId,
    materialId,
    question,
  );
  res.status(200).json({ success: true, data: result });
});

export const generateExam = asyncHandler(async (req, res) => {
  const { curriculumCourseId, materialId } = req.params;
  const { topic } = req.query;
  const result = await aiService.generateExamFromMaterial(
    req.studentId,
    curriculumCourseId,
    materialId,
    topic || null,
  );
  res.status(201).json({ success: true, data: result });
});
