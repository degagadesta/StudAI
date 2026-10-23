import * as studySessionService from "./studySession.service.js";
import { validateStartSession, validateEndSession, validatePomodoroIncrement } from "./studySession.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// ────────────────────────────────────────────────────────────────────
// START STUDY SESSION
// ────────────────────────────────────────────────────────────────────
export const startSession = asyncHandler(async (req, res) => {
    const { courseId, materialId, type } = req.body;

    validateStartSession({ courseId, materialId, type });

    const session = await studySessionService.startStudySession(req.studentId, {
        courseId,
        materialId,
        type,
    });

    res.status(201).json({
        success: true,
        message: "Study session started",
        data: session,
    });
});

// ────────────────────────────────────────────────────────────────────
// END STUDY SESSION
// ────────────────────────────────────────────────────────────────────
export const endSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { duration } = req.body;

    validateEndSession({ duration });

    const session = await studySessionService.endStudySession(req.studentId, id, duration);

    res.status(200).json({
        success: true,
        message: "Study session ended",
        data: session,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET ACTIVE SESSION
// ────────────────────────────────────────────────────────────────────
export const getActiveSession = asyncHandler(async (req, res) => {
    const session = await studySessionService.getActiveSession(req.studentId);

    res.status(200).json({
        success: true,
        data: session,
    });
});

// ────────────────────────────────────────────────────────────────────
// INCREMENT POMODORO
// ────────────────────────────────────────────────────────────────────
export const incrementPomodoro = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await studySessionService.incrementPomodoro(req.studentId, id);

    res.status(200).json({
        success: true,
        message: "Pomodoro count incremented",
        data: session,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET STUDY HISTORY
// ────────────────────────────────────────────────────────────────────
export const getHistory = asyncHandler(async (req, res) => {
    const { limit, offset, courseId, startDate, endDate } = req.query;

    const history = await studySessionService.getStudyHistory(req.studentId, {
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
        courseId,
        startDate,
        endDate,
    });

    res.status(200).json({
        success: true,
        data: history,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET STUDY STATISTICS
// ────────────────────────────────────────────────────────────────────
export const getStatistics = asyncHandler(async (req, res) => {
    const stats = await studySessionService.getStudyStatistics(req.studentId);

    res.status(200).json({
        success: true,
        data: stats,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET STUDY STREAK
// ────────────────────────────────────────────────────────────────────
export const getStreak = asyncHandler(async (req, res) => {
    const streak = await studySessionService.getStudyStreak(req.studentId);

    res.status(200).json({
        success: true,
        data: streak,
    });
});

// ────────────────────────────────────────────────────────────────────
// GET STUDY CALENDAR
// ────────────────────────────────────────────────────────────────────
export const getCalendar = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: "startDate and endDate are required",
        });
    }

    const calendar = await studySessionService.getStudyCalendar(
        req.studentId,
        new Date(startDate),
        new Date(endDate)
    );

    res.status(200).json({
        success: true,
        data: calendar,
    });
});
