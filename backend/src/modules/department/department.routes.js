import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getDepartments, getDepartment, getCurricula } from "./department.controller.js";

const router = Router();

// Generous limit — these are public lookup endpoints used during onboarding
const browseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later" },
});

router.get("/university/:universityId", browseLimiter, getDepartments);
router.get("/:departmentId/curricula", browseLimiter, getCurricula);
router.get("/:id", browseLimiter, getDepartment);

export default router;
