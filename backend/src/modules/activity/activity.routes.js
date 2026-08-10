import { Router } from "express";
import {
    startSession,
    heartbeat,
    endSession,
    getActiveSession,
    getSessionStats,
} from "./activity.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/start", authenticate, startSession);
router.post("/heartbeat", authenticate, heartbeat);
router.post("/end", authenticate, endSession);
router.get("/current", authenticate, getActiveSession);
router.get("/stats", authenticate, getSessionStats);

export default router;
