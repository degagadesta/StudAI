import { Router } from "express";
import { getUsageSummary, checkFeatureAccess } from "./usage.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

// Get current usage summary
router.get("/summary", authenticate, getUsageSummary);

// Check if can use specific feature
router.get("/check/:feature", authenticate, checkFeatureAccess);

export default router;
