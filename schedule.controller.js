import { ResponseError } from "../error/response-error.js";
import scheduleService from "../services/schedule.service.js";

/**
 * ============================================
 * SCHEDULE CONTROLLER
 * Handles HTTP requests for schedule endpoints
 * ============================================
 */

/**
 * Get schedule by date
 * GET /api/users/schedule/date?date=YYYY-MM-DD
 */
const getScheduleByDateController = async (req, res, next) => {
    try {
        const { date } = req.query;

        if (!date) {
            throw new ResponseError(400, "Date parameter is required");
        }

        const request = {
            date,
            profileId: req.user.profileId,
            role: req.user.role
        };

        const result = await scheduleService.getScheduleByDate(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get weekly schedule
 * GET /api/users/schedule/weekly?startDate=YYYY-MM-DD
 */
const getWeeklyScheduleController = async (req, res, next) => {
    try {
        const { startDate } = req.query;

        const request = {
            startDate: startDate || new Date().toISOString().split('T')[0],
            profileId: req.user.profileId,
            role: req.user.role
        };

        const result = await scheduleService.getWeeklySchedule(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get schedule by academic period
 * GET /api/users/schedule/academic-period/:academicPeriodId
 */
const getScheduleByAcademicPeriodController = async (req, res, next) => {
    try {
        const academicPeriodId = parseInt(req.params.academicPeriodId);

        if (isNaN(academicPeriodId)) {
            throw new ResponseError(400, "Invalid academic period ID");
        }

        const request = {
            academicPeriodId,
            profileId: req.user.profileId,
            role: req.user.role,
            classId: req.user.classId
        };

        const result = await scheduleService.getScheduleByAcademicPeriod(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Get teacher schedules (classes they teach)
 * GET /api/teacher/schedules
 */
const getTeacherSchedulesController = async (req, res, next) => {
    try {
        if (req.user.role !== "teacher" && req.user.role !== "admin") {
            throw new ResponseError(403, "Only teachers and admins can view teacher schedules");
        }

        const teacherId = req.user.role === "admin" && req.query.teacherId 
            ? parseInt(req.query.teacherId) 
            : req.user.profileId;

        const academicPeriodId = req.query.academicPeriodId 
            ? parseInt(req.query.academicPeriodId) 
            : undefined;

        const isActive = req.query.isActive !== undefined 
            ? req.query.isActive === 'true' 
            : undefined;

        const request = {
            teacherId,
            academicPeriodId,
            isActive
        };

        const result = await scheduleService.getTeacherSchedules(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Create schedule (Admin only)
 * POST /api/admin/schedules
 */
const createScheduleController = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ResponseError(403, "Only admins can create schedules");
        }

        const result = await scheduleService.createSchedule(req.body);

        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Update schedule (Admin only)
 * PATCH /api/admin/schedules/:id
 */
const updateScheduleController = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ResponseError(403, "Only admins can update schedules");
        }

        const scheduleId = parseInt(req.params.id);

        if (isNaN(scheduleId)) {
            throw new ResponseError(400, "Invalid schedule ID");
        }

        const request = {
            scheduleId,
            updates: req.body
        };

        const result = await scheduleService.updateSchedule(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Delete schedule (Admin only)
 * DELETE /api/admin/schedules/:id?softDelete=true
 */
const deleteScheduleController = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ResponseError(403, "Only admins can delete schedules");
        }

        const scheduleId = parseInt(req.params.id);

        if (isNaN(scheduleId)) {
            throw new ResponseError(400, "Invalid schedule ID");
        }

        const softDelete = req.query.softDelete === 'true';

        const request = {
            scheduleId,
            softDelete
        };

        const result = await scheduleService.deleteSchedule(request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

/**
 * Bulk create schedules (Admin only)
 * POST /api/admin/schedules/bulk
 */
const bulkCreateSchedulesController = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ResponseError(403, "Only admins can bulk create schedules");
        }

        const result = await scheduleService.bulkCreateSchedules(req.body);

        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    getScheduleByDateController,
    getWeeklyScheduleController,
    getScheduleByAcademicPeriodController,
    getTeacherSchedulesController,
    createScheduleController,
    updateScheduleController,
    deleteScheduleController,
    bulkCreateSchedulesController
};
