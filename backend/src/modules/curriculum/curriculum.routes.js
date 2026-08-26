import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getCurriculumCourses } from "./curriculum.controller.js";

const router = Router();

const browseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later" },
});

// GET /curricula/:curriculumId/courses
router.get("/:curriculumId/courses", browseLimiter, getCurriculumCourses);

export default router;
