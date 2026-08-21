import * as activityService from "./activity.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { invalidateAnalytics } from "../../utils/cacheInvalidation.js";
import { emitToStudent } from "../../lib/socket.js";

/**
 * Start or resume activity session
 */
export const startSession = asyncHandler(async (req, res) => {
    const result = await activityService.startOrResumeSession(req.studentId);

    res.status(result.isNew ? 201 : 200).json({
        success: true,
        message: result.isNew ? "Session started" : "Session resumed",
        data: result,
    });
});

/**
 * Heartbeat - update session activity
 */
export const heartbeat = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        // No sessionId provided, start new session
        const result = await activityService.startOrResumeSession(req.studentId);

        // Emit analytics update for new session
        emitToStudent(req.studentId, "analytics:updated", {
            trigger: "session_started",
            sessionId: result.sessionId
        });

        return res.status(201).json({
            success: true,
            message: "New session started",
            data: result,
        });
    }

    try {
        const result = await activityService.updateSessionActivity(sessionId);

        // Emit analytics update for activity heartbeat directly
        emitToStudent(req.studentId, "analytics:updated", {
            trigger: "session_active",
            sessionId: result.sessionId,
            duration: result.duration
        });

        res.status(200).json({
            success: true,
            message: "Activity updated",
            data: result,
        });
    } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
            // Session expired or not found, start new one
            const result = await activityService.startOrResumeSession(req.studentId);

            // Emit analytics update for new session after expiry
            emitToStudent(req.studentId, "analytics:updated", {
                trigger: "session_restarted",
                sessionId: result.sessionId
            });

            return res.status(201).json({
                success: true,
                message: "New session started after expiry",
                data: result,
            });
        }
        throw err;
    }
});

/**
 * End activity session
 */
export const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: "sessionId is required",
        });
    }

    const result = await activityService.closeSession(sessionId);

    // Invalidate analytics cache when session ends (affects stats)
    await invalidateAnalytics(req.studentId);

    // Emit analytics update when session ends
    emitToStudent(req.studentId, "analytics:updated", {
        trigger: "session_ended",
        sessionId: result.sessionId,
        duration: result.duration
    });

    res.status(200).json({
        success: true,
        message: "Session ended",
        data: result,
    });
});

/**
 * Get current active session
 */
export const getActiveSession = asyncHandler(async (req, res) => {
    const session = await activityService.getActiveSession(req.studentId);

    res.status(200).json({
        success: true,
        data: session,
    });
});

/**
 * Get session statistics
 */
export const getSessionStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await activityService.getSessionStats(req.studentId, start, end);

    res.status(200).json({
        success: true,
        data: stats,
    });
});
