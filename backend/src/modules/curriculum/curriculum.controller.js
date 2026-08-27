import { asyncHandler } from "../../utils/asyncHandler.js";
import * as curriculumService from "./curriculum.service.js";

/**
 * GET /curricula/:curriculumId/courses
 * Returns all CurriculumCourse records for a given curriculum
 */
export const getCurriculumCourses = asyncHandler(async (req, res) => {
    const { curriculumId } = req.params;
    const courses = await curriculumService.getCoursesByCurriculum(curriculumId);
    return res.status(200).json({ success: true, data: courses });
});
