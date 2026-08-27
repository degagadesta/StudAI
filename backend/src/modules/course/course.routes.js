import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { cacheStudentData } from "../../middlewares/cache.js";
import {
  getCourses,
  addCourseSelection,
  dropCourseSelection,
  getAvailableCourses,
} from "./course.controller.js";

const router = Router();

// Cache enrolled courses for 5 minutes
router.get("/", authenticate, cacheStudentData("courses:enrolled", 300), getCourses);
// Cache available courses catalog for 10 minutes (less frequently changing)
router.get("/catalog", authenticate, cacheStudentData("courses:catalog", 600), getAvailableCourses);

router.post("/select", authenticate, addCourseSelection);
router.delete("/select/:curriculumCourseId", authenticate, dropCourseSelection);

export default router;
