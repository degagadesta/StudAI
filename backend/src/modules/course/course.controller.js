import * as courseService from "./course.service.js";

export const getCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getStudentCourses(req.studentId);

        return res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        next(error);
    }
};