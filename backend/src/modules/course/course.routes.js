import { Router } from "express";
import { getCourses, addCourseSelection, dropCourseSelection } from "./course.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getCourses);
router.post("/select", authenticate, addCourseSelection);
router.delete("/select/:curriculumCourseId", authenticate, dropCourseSelection);

export default router;