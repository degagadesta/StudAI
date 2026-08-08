import * as dashboardService from "./dashboard.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const data = await dashboardService.getDashboardData(req.studentId);

    res.status(200).json({
        success: true,
        data
    });
});

export const getDashboardPDFs = asyncHandler(async (req, res) => {
    // Parse and validate query params
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 3, 1), 50);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const search = req.query.search?.trim() || null;

    const data = await dashboardService.getDashboardPDFs(req.studentId, {
        limit,
        offset,
        search,
    });

    res.status(200).json({ success: true, data });
});
