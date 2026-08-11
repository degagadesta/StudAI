import * as profileService from "./profile.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validateProfileUpdate } from "./profile.validation.js";
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

export async function updateProfileController(req, res, next) {
    try {
        validateProfileUpdate(req.body);

        const studentId = req.studentId;

        const result = await updateProfile(
            studentId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}