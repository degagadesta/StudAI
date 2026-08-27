import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { cacheStudentData } from "../../middlewares/cache.js";
import { getAnalytics } from "./analytics.controller.js";

const router = Router();

// Cache analytics for 60 seconds
router.get("/", authenticate, cacheStudentData("analytics", 60), getAnalytics);

export default router;
