import * as onboardingService from "./onboarding.service.js";

export const onboarding = async (req, res, next) => {
    try {
        const {
            universityId,
            departmentId,
            currentYear,
            currentSemester,
        } = req.body;

        const result = await onboardingService.completeOnboarding(
            req.user.id,
            universityId,
            departmentId,
            currentYear,
            currentSemester
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