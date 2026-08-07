import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getAnalytics } from "./analytics.controller.js";

const router = Router();

router.get("/", authenticate, getAnalytics);

export default router;
