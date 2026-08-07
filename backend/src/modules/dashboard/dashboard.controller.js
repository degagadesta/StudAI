import * as dashboardService from "./dashboard.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const data = await dashboardService.getDashboardData(req.studentId);

    res.status(200).json({
        success: true,
        data
    });
});
