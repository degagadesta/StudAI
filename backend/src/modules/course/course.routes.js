import { Router } from "express";
import { getCourses } from "./course.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getCourses);

export default router;