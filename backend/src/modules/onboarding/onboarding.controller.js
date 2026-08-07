import * as onboardingService from "./onboarding.service.js";
import { AppError } from "../../utils/AppError.js";

export const getAvailableCourses = async (req, res, next) => {
    try {
        const { universityId, departmentId, year, semester } = req.query;

        if (!universityId || !departmentId || !year || !semester) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameters: universityId, departmentId, year, semester",
            });
        }

        const courses = await onboardingService.getAvailableCourses(
            universityId,
            departmentId,
            parseInt(year),
            parseInt(semester)
        );

        return res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        next(error);
    }
};

export const onboarding = async (req, res, next) => {
    try {
        const {
            universityId,
            departmentId,
            currentYear,
            currentSemester,
            selectedCourseIds,
        } = req.body;

        // Validate required fields
        if (!universityId || !departmentId || !currentYear || !currentSemester) {
            throw new AppError("All fields are required: universityId, departmentId, currentYear, currentSemester", 400);
        }

        // Validate data types
        if (typeof universityId !== 'string' || typeof departmentId !== 'string') {
            throw new AppError("Invalid university or department ID", 400);
        }

        const year = parseInt(currentYear);
        const semester = parseInt(currentSemester);

        if (isNaN(year) || isNaN(semester)) {
            throw new AppError("Year and semester must be numbers", 400);
        }

        const result = await onboardingService.completeOnboarding(
            req.studentId,
            universityId,
            departmentId,
            year,
            semester,
            selectedCourseIds
        );

        return res.status(200).json({
            success: true,
            message: "Academic onboarding completed successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};