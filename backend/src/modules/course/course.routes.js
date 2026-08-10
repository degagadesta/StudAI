import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  getCourses,
  addCourseSelection,
  dropCourseSelection,
  getAvailableCourses,
} from "./course.controller.js";

const router = Router();

router.get("/", authenticate, getCourses);
// router.get("/getAllCourses", authenticate, getCourseAdded)
router.post("/select", authenticate, addCourseSelection);
router.delete("/select/:curriculumCourseId", authenticate, dropCourseSelection);
router.get("/catalog", authenticate, getAvailableCourses);

export default router;
