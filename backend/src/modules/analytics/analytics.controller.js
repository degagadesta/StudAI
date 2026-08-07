import * as analyticsService from "./analytics.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAnalytics(req.studentId);
  res.status(200).json({ success: true, data });
});
