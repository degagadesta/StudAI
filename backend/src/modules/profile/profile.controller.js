import * as profileService from "./profile.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validateBasicInfo, validateAcademicInfo } from "./profile.validation.js";

export const getProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getAcademicProfile(req.studentId);

    res.status(200).json({
        success: true,
        data: profile,
    });
});

export const getFullProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getFullProfile(req.studentId);

    res.status(200).json({
        success: true,
        data: profile,
    });
});

export const updateBasicInfo = asyncHandler(async (req, res) => {
    const { firstName, lastName } = req.body;

    // Validate input
    validateBasicInfo({ firstName, lastName });

    // Update profile
    const updatedInfo = await profileService.updateBasicInfo(req.studentId, {
        firstName,
        lastName,
    });

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedInfo,
    });
});

export const updateAcademicInfo = asyncHandler(async (req, res) => {
    const { currentYear, currentSemester } = req.body;

    // Validate input
    validateAcademicInfo({ currentYear, currentSemester });

    // Update academic info
    const updatedInfo = await profileService.updateAcademicInfo(req.studentId, {
        currentYear,
        currentSemester,
    });

    // Add warning if course selections were cleared
    const response = {
        success: true,
        message: "Academic information updated successfully",
        data: updatedInfo,
    };

    if (updatedInfo.courseSelectionsCleared) {
        response.warning = "Your course selections have been reset. Please select your courses again for the new year/semester";
    }

    res.status(200).json(response);
});
