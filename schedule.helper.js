import { prismaClient } from "../application/database.js";

/**
 * ============================================
 * SCHEDULE HELPER FUNCTIONS
 * Utility functions for schedule operations
 * ============================================
 */

/**
 * Check for time conflicts
 * Prevents scheduling conflicts for teachers, classes, and rooms
 * 
 * @param {Object} params - Schedule parameters
 * @returns {Object} { hasConflict: boolean, message: string }
 */
const checkTimeConflict = async (params) => {
    const {
        teacherId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        academicPeriodId,
        excludeScheduleId
    } = params;

    const whereClause = {
        dayOfWeek: dayOfWeek,
        academicPeriodId: academicPeriodId,
        isActive: true
    };

    if (excludeScheduleId) {
        whereClause.id = { not: excludeScheduleId };
    }

    // Check teacher conflict
    const teacherConflict = await prismaClient.classSchedule.findFirst({
        where: {
            ...whereClause,
            teacherId: teacherId,
            OR: [
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            ]
        }
    });

    if (teacherConflict) {
        return {
            hasConflict: true,
            message: `Teacher has conflicting schedule at ${teacherConflict.startTime}-${teacherConflict.endTime}`
        };
    }

    // Check class conflict
    const classConflict = await prismaClient.classSchedule.findFirst({
        where: {
            ...whereClause,
            classId: classId,
            OR: [
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            ]
        }
    });

    if (classConflict) {
        return {
            hasConflict: true,
            message: `Class has conflicting schedule at ${classConflict.startTime}-${classConflict.endTime}`
        };
    }

    return {
        hasConflict: false,
        message: null
    };
};

/**
 * Merge schedules with session data
 * Combines schedule info with session information
 * 
 * @param {Array} schedules - Array of schedule objects
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Merged schedule+session data
 */
const mergeSchedulesWithSessions = (schedules, sessions) => {
    const sessionMap = new Map();
    sessions.forEach(session => {
        if (!sessionMap.has(session.classScheduleId)) {
            sessionMap.set(session.classScheduleId, []);
        }
        sessionMap.get(session.classScheduleId).push(session);
    });

    return schedules.map(schedule => ({
        ...schedule,
        sessions: sessionMap.get(schedule.id) || []
    }));
};

/**
 * Format schedule for role-specific response
 * Customizes schedule data based on user role
 * 
 * @param {Object} schedule - Schedule object
 * @param {String} role - User role (teacher/student/admin)
 * @returns {Object} Formatted schedule
 */
const formatScheduleForRole = (schedule, role) => {
    const base = {
        id: schedule.id,
        subjectName: schedule.subject?.name,
        className: schedule.class?.name,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room
    };

    if (role === 'teacher') {
        base.classId = schedule.classId;
        base.totalSessions = schedule._count?.attendanceSessions || 0;
    }

    if (role === 'student') {
        base.teacherName = schedule.teacher?.fullName;
    }

    if (role === 'admin') {
        base.teacherId = schedule.teacherId;
        base.teacherName = schedule.teacher?.fullName;
        base.classId = schedule.classId;
        base.subjectId = schedule.subjectId;
        base.isActive = schedule.isActive;
    }

    return base;
};

/**
 * Group schedules by day of week
 * 
 * @param {Array} schedules - Array of schedule objects
 * @returns {Object} Schedules grouped by day { 1: [], 2: [], ... }
 */
const groupSchedulesByDay = (schedules) => {
    const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    
    schedules.forEach(schedule => {
        grouped[schedule.dayOfWeek].push(schedule);
    });

    return grouped;
};

/**
 * Validate time range
 * Ensures end time is after start time
 * 
 * @param {String} startTime - Start time HH:MM:SS
 * @param {String} endTime - End time HH:MM:SS
 * @returns {Boolean} True if valid
 * @throws {Error} If invalid
 */
const validateTimeRange = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (end <= start) {
        throw new Error("End time must be after start time");
    }

    return true;
};

/**
 * Calculate schedule duration in minutes
 * 
 * @param {String} startTime - Start time HH:MM:SS
 * @param {String} endTime - End time HH:MM:SS
 * @returns {Number} Duration in minutes
 */
const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    const durationMs = end - start;
    return Math.round(durationMs / 1000 / 60);
};

/**
 * Get day name from day number
 * 
 * @param {Number} dayNumber - Day number (1-7)
 * @returns {String} Day name
 */
const getDayName = (dayNumber) => {
    const days = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday'
    };
    
    return days[dayNumber] || 'Unknown';
};

/**
 * Sort schedules by time
 * 
 * @param {Array} schedules - Array of schedule objects
 * @returns {Array} Sorted schedules
 */
const sortSchedulesByTime = (schedules) => {
    return schedules.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
            return a.dayOfWeek - b.dayOfWeek;
        }
        return a.startTime.localeCompare(b.startTime);
    });
};

/**
 * Check if schedule is currently active (happening now)
 * 
 * @param {Object} schedule - Schedule object
 * @param {Date} currentDate - Current date/time
 * @returns {Boolean} True if active now
 */
const isScheduleActive = (schedule, currentDate = new Date()) => {
    const currentDay = convertToPrismaDay(currentDate.getDay());
    const currentTime = currentDate.toTimeString().slice(0, 8);

    return schedule.dayOfWeek === currentDay &&
           currentTime >= schedule.startTime &&
           currentTime <= schedule.endTime;
};

/**
 * Convert JS day (0-6) to Prisma day (1-7)
 * 
 * @param {Number} jsDay - JavaScript day (0=Sunday, 6=Saturday)
 * @returns {Number} Prisma day (1=Monday, 7=Sunday)
 */
const convertToPrismaDay = (jsDay) => {
    return jsDay === 0 ? 7 : jsDay;
};

export {
    checkTimeConflict,
    mergeSchedulesWithSessions,
    formatScheduleForRole,
    groupSchedulesByDay,
    validateTimeRange,
    calculateDuration,
    getDayName,
    sortSchedulesByTime,
    isScheduleActive,
    convertToPrismaDay
};
