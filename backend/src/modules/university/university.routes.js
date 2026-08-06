import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getUniversities, getUniversity } from "./university.controller.js";

const router = Router();

// Generous limit — these are public lookup endpoints used during onboarding
const browseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later" },
});

router.get("/", browseLimiter, getUniversities);
router.get("/:id", browseLimiter, getUniversity);

export default router;
