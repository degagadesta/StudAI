import * as usageService from "./usage.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { prisma } from "../../lib/prisma.js";

/**
 * GET /api/usage/summary
 * Get current usage summary for authenticated student
 */
export const getUsageSummary = asyncHandler(async (req, res) => {
  const studentId = req.studentId;

  const summary = await usageService.getUsageSummary(studentId);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * GET /api/usage/check/:feature
 * Check if student can use a specific feature
 */
export const checkFeatureAccess = asyncHandler(async (req, res) => {
  const studentId = req.studentId;
  const { feature } = req.params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      error: "Student not found",
    });
  }

  const canUse = await usageService.canUseFeature(
    studentId,
    student.subscriptionPlan,
    feature
  );

  res.status(200).json({
    success: true,
    data: {
      feature,
      canUse,
    },
  });
});
