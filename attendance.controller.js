import { ResponseError } from "../error/response-error.js";
import attendanceService from "../services/attendance.service.js";

/**
 * ============================================
 * ATTENDANCE CONTROLLER
 * Handles HTTP requests for attendance endpoints
 * ============================================
 */

/**
 * Mark attendance (bulk update)
 * POST /api/teacher/sessions/:sessionId/attendance
 */
const markAttendanceController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can mark attendance");
        }

        const sessionId = parseInt(req.params.sessionId);

        if (isNaN(sessionId)) {
            throw new ResponseError(400, "Invalid session ID");
        }

        const request = {
            sessionId,
            attendances: req.body.attendances,
            profileId: req.user.profileId
        };

        const result = await attendanceService.markAttendance(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Mark single attendance
 * PATCH /api/teacher/attendance/:id
 */
const markSingleAttendanceController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher") {
            throw new ResponseError(403, "Only teachers can mark attendance");
        }

        const attendanceId = parseInt(req.params.id);

        if (isNaN(attendanceId)) {
            throw new ResponseError(400, "Invalid attendance ID");
        }

        const request = {
            attendanceId,
            status: req.body.status,
            notes: req.body.notes,
            profileId: req.user.profileId
        };

        const result = await attendanceService.markSingleAttendance(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Student check-in
 * POST /api/student/attendance/check-in
 */
const studentCheckInController = async (req, res, next) => {
    try {
        if (req.user.role !== "student") {
            throw new ResponseError(403, "Only students can check in");
        }

        const request = {
            sessionId: req.body.sessionId,
            studentId: req.user.profileId,
            method: req.body.method || 'face_recognition',
            faceConfidence: req.body.faceConfidence
        };

        const result = await attendanceService.studentCheckIn(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get attendance by session
 * GET /api/users/attendance/session/:sessionId
 */
const getAttendanceBySessionController = async (req, res, next) => {
    try {
        const sessionId = parseInt(req.params.sessionId);

        if (isNaN(sessionId)) {
            throw new ResponseError(400, "Invalid session ID");
        }

        const request = {
            sessionId,
            profileId: req.user.profileId,
            role: req.user.role
        };

        const result = await attendanceService.getAttendanceBySession(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get student attendance history
 * GET /api/users/attendance/student/:studentId/history
 */
const getStudentAttendanceHistoryController = async (req, res, next) => {
    try {
        const studentId = parseInt(req.params.studentId);

        if (isNaN(studentId)) {
            throw new ResponseError(400, "Invalid student ID");
        }

        // Authorization: students can only view their own, teachers/admins can view any
        if (req.user.role === 'student' && req.user.profileId !== studentId) {
            throw new ResponseError(403, "You can only view your own attendance history");
        }

        const request = {
            studentId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            subjectId: req.query.subjectId ? parseInt(req.query.subjectId) : undefined,
            status: req.query.status
        };

        const result = await attendanceService.getStudentAttendanceHistory(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get attendance summary
 * GET /api/users/attendance/summary/:type/:id
 */
const getAttendanceSummaryController = async (req, res, next) => {
    try {
        const { type, id } = req.params;

        const validTypes = ['class', 'teacher', 'student'];
        if (!validTypes.includes(type)) {
            throw new ResponseError(400, "Invalid summary type. Use: class, teacher, or student");
        }

        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            throw new ResponseError(400, "Invalid ID");
        }

        // Authorization checks
        if (req.user.role === 'student') {
            if (type !== 'student' || parsedId !== req.user.profileId) {
                throw new ResponseError(403, "Students can only view their own summary");
            }
        }

        if (req.user.role === 'teacher') {
            if (type === 'teacher' && parsedId !== req.user.profileId) {
                throw new ResponseError(403, "Teachers can only view their own summary");
            }
        }

        const request = {
            type,
            id: parsedId,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const result = await attendanceService.getAttendanceSummary(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Export attendance report
 * GET /api/teacher/attendance/report/export
 */
const exportAttendanceReportController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher" && req.user.role !== "admin") {
            throw new ResponseError(403, "Only teachers and admins can export reports");
        }

        const classId = parseInt(req.query.classId);

        if (isNaN(classId)) {
            throw new ResponseError(400, "Class ID is required");
        }

        if (!req.query.startDate || !req.query.endDate) {
            throw new ResponseError(400, "Start date and end date are required");
        }

        const request = {
            classId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            format: req.query.format || 'json'
        };

        const result = await attendanceService.exportAttendanceReport(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get attendance analytics
 * GET /api/admin/attendance/analytics
 */
const getAttendanceAnalyticsController = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ResponseError(403, "Only admins can view analytics");
        }

        const classId = parseInt(req.query.classId);

        if (isNaN(classId)) {
            throw new ResponseError(400, "Class ID is required");
        }

        if (!req.query.startDate || !req.query.endDate) {
            throw new ResponseError(400, "Start date and end date are required");
        }

        const filters = {
            classId,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            groupBy: req.query.groupBy || 'day'
        };

        const result = await attendanceService.getAttendanceAnalytics(filters);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    markAttendanceController,
    markSingleAttendanceController,
    studentCheckInController,
    getAttendanceBySessionController,
    getStudentAttendanceHistoryController,
    getAttendanceSummaryController,
    exportAttendanceReportController,
    getAttendanceAnalyticsController
};
