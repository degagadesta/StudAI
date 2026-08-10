import * as courseService from "./course.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validateCourseSelection } from "./course.validation.js";

export const getCourses = async (req, res, next) => {
  try {
    // Get search query from query parameters
    const searchQuery = req.query.search || null;

    const courses = await courseService.getStudentCourses(
      req.studentId,
      searchQuery,
    );

    return res.status(200).json({
      success: true,
      data: courses,
      search: searchQuery
        ? {
            query: searchQuery,
            resultCount: courses.length,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableCourses = asyncHandler(async (req, res) => {
  const searchQuery = req.query.search || null;
  const filters = {
    year: req.query.year ? Number(req.query.year) : undefined,
    semester: req.query.semester ? Number(req.query.semester) : undefined,
  };

  const courses = await courseService.getAvailableCourses(
    req.studentId,
    searchQuery,
    filters,
  );

  res.status(200).json({
    success: true,
    data: courses,
    search: searchQuery
      ? { query: searchQuery, resultCount: courses.length }
      : null,
  });
});

export const addCourseSelection = asyncHandler(async (req, res) => {
  const { curriculumCourseId } = req.body;

  // Validate input
  validateCourseSelection({ curriculumCourseId });

  // Add course to selection
  const result = await courseService.addCourseSelection(
    req.studentId,
    curriculumCourseId,
  );

  res.status(201).json({
    success: true,
    message: "Course added to your schedule",
    data: result,
  });
});

export const dropCourseSelection = asyncHandler(async (req, res) => {
  const { curriculumCourseId } = req.params;

  // Validate input
  validateCourseSelection({ curriculumCourseId });

  // Drop course and delete PDFs
  const result = await courseService.dropCourseSelection(
    req.studentId,
    curriculumCourseId,
  );

  // Add warning if PDFs were deleted
  const response = {
    success: true,
    message: "Course dropped successfully",
    data: result,
  };

  if (result.deletedPDFs > 0) {
    response.warning = `${result.deletedPDFs} PDF${result.deletedPDFs > 1 ? "s" : ""} associated with this course have been permanently deleted`;
  }

  res.status(200).json(response);
});
