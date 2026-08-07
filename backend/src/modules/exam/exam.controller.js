import * as examService from "./exam.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getUpcomingExams = asyncHandler(async (req, res) => {
    const exams = await examService.getUpcomingExams(req.studentId);

    res.status(200).json({
        success: true,
        data: exams
    });
});
