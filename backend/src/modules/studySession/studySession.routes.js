import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
    startSession,
    endSession,
    getActiveSession,
    incrementPomodoro,
    getHistory,
    getStatistics,
    getStreak,
    getCalendar,
} from "./studySession.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Session management
router.post("/start", startSession);
router.post("/:id/end", endSession);
router.get("/active", getActiveSession);
router.post("/:id/pomodoro", incrementPomodoro);

// History and statistics
router.get("/history", getHistory);
router.get("/stats", getStatistics);
router.get("/streak", getStreak);
router.get("/calendar", getCalendar);

export default router;
