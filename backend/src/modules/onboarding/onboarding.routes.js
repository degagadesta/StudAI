import { Router } from "express";
import { onboarding, getAvailableCourses } from "./onboarding.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/courses", authenticate, getAvailableCourses);
router.post("/", authenticate, onboarding);

export default router;