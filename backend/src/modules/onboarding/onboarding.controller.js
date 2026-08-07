import * as onboardingService from "./onboarding.service.js";
import { AppError } from "../../utils/AppError.js";

export const getAvailableCourses = async (req, res, next) => {
    try {
        const { universityId, departmentId, year, semester } = req.query;

        if (!universityId || !departmentId || !year || !semester) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required information: university, department, year, and semester",
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
            throw new AppError("Please fill in all required fields: university, department, year, and semester", 400);
        }

        // Validate data types
        if (typeof universityId !== 'string' || typeof departmentId !== 'string') {
            throw new AppError("Please select valid university and department", 400);
        }

        const year = parseInt(currentYear);
        const semester = parseInt(currentSemester);

        if (isNaN(year) || isNaN(semester)) {
            throw new AppError("Please enter valid numbers for year and semester", 400);
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