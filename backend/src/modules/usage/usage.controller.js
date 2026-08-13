import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as usageService from "./usage.service.js";

export const getUsage = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.studentId },
    select: { subscriptionPlan: true },
  });

  const usage = await usageService.getUsageSummary(
    req.studentId,
    student.subscriptionPlan,
  );

  res.status(200).json({ success: true, data: usage });
});
