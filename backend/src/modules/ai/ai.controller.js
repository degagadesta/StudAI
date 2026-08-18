import { asyncHandler } from "../../utils/asyncHandler.js";
import * as aiService from "./ai.service.js";

export const generateSummary = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const { forceRegenerate } = req.query;
  const result = await aiService.generateSummary(
    materialId,
    req.studentId,
    forceRegenerate === "true",
  );
  res.status(200).json({ success: true, data: result });
});

export const generateFlashcards = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const { count } = req.body;
  const { forceRegenerate } = req.query;
  const result = await aiService.generateFlashcards(
    materialId,
    req.studentId,
    count || 10,
    forceRegenerate === "true",
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

export const explainTopic = asyncHandler(async (req, res) => {
  const { materialId, curriculumCourseId, selectedText } = req.body;
  const result = await aiService.explainTopic(
    req.studentId,
    materialId,
    curriculumCourseId,
    selectedText,
  );
  res.status(200).json({ success: true, data: result });
});
