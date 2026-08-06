import * as onboardingService from "./onboarding.service.js";

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

        const result = await onboardingService.completeOnboarding(
            req.studentId,
            universityId,
            departmentId,
            currentYear,
            currentSemester,
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