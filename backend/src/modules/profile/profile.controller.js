import * as profileService from "./profile.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
    const profile = await profileService.getAcademicProfile(req.studentId);

    res.status(200).json({
        success: true,
        data: profile,
    });
});
