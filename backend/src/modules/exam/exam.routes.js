import { Router } from "express";
import { getUpcomingExams } from "./exam.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/upcoming", authenticate, getUpcomingExams);

export default router;
