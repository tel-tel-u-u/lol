import { ResponseError } from "../error/response-error.js";
import sessionService from "../services/session.service.js";

/**
 * ============================================
 * SESSION CONTROLLER
 * Handles HTTP requests for session endpoints
 * ============================================
 */

/**
 * Create new attendance session
 * POST /api/teacher/sessions
 * Body: { classScheduleId, date, notes? }
 */
const createSessionController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can create sessions");
        }

        const request = {
            ...req.body,
            profileId: req.user.profileId
        };

        const result = await sessionService.createSession(request);

        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get session details
 * GET /api/teacher/sessions/:id
 */
const getSessionController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can view session details");
        }

        const sessionId = parseInt(req.params.id);

        if (isNaN(sessionId)) {
            throw new ResponseError(400, "Invalid session ID");
        }

        const request = {
            sessionId,
            profileId: req.user.profileId
        };

        const result = await sessionService.getSession(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get sessions list for a class schedule
 * GET /api/teacher/schedule/:scheduleId/sessions
 */
const getSessionsListController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can view sessions list");
        }

        const classScheduleId = parseInt(req.params.scheduleId);

        if (isNaN(classScheduleId)) {
            throw new ResponseError(400, "Invalid class schedule ID");
        }

        const request = {
            classScheduleId,
            profileId: req.user.profileId
        };

        const result = await sessionService.getSessionsList(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Update session status
 * PATCH /api/teacher/sessions/:id/status
 * Body: { status: 'ongoing' | 'completed' | 'cancelled' }
 */
const updateSessionStatusController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can update session status");
        }

        const sessionId = parseInt(req.params.id);

        if (isNaN(sessionId)) {
            throw new ResponseError(400, "Invalid session ID");
        }

        const request = {
            sessionId,
            status: req.body.status,
            profileId: req.user.profileId
        };

        const result = await sessionService.updateSessionStatus(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * End/complete a session
 * POST /api/teacher/sessions/:id/end
 */
const endSessionController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can end sessions");
        }

        const sessionId = parseInt(req.params.id);

        if (isNaN(sessionId)) {
            throw new ResponseError(400, "Invalid session ID");
        }

        const request = {
            sessionId,
            profileId: req.user.profileId
        };

        const result = await sessionService.endSession(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Cancel a session
 * POST /api/teacher/sessions/:id/cancel
 */
const cancelSessionController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can cancel sessions");
        }

        const sessionId = parseInt(req.params.id);

        if (isNaN(sessionId)) {
            throw new ResponseError(400, "Invalid session ID");
        }

        const request = {
            sessionId,
            profileId: req.user.profileId
        };

        const result = await sessionService.cancelSession(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get active sessions
 * GET /api/student/sessions/active OR GET /api/teacher/sessions/active
 */
const getActiveSessionsController = async (req, res, next) => {
    try {
        if (req.user.role !== "student" && req.user.role !== "teacher") {
            throw new ResponseError(403, "Only students and teachers can view active sessions");
        }

        const request = {
            profileId: req.user.profileId,
            role: req.user.role
        };

        const result = await sessionService.getActiveSessions(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get session statistics (Admin only)
 * GET /api/admin/sessions/statistics
 * Query: startDate?, endDate?, classId?, teacherId?
 */
const getSessionStatisticsController = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ResponseError(403, "Only admins can view session statistics");
        }

        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            classId: req.query.classId ? parseInt(req.query.classId) : undefined,
            teacherId: req.query.teacherId ? parseInt(req.query.teacherId) : undefined
        };

        const result = await sessionService.getSessionStatistics(filters);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    createSessionController,
    getSessionController,
    getSessionsListController,
    updateSessionStatusController,
    endSessionController,
    cancelSessionController,
    getActiveSessionsController,
    getSessionStatisticsController
};
