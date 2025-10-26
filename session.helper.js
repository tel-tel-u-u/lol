import { ResponseError } from "../error/response-error.js";

/**
 * ============================================
 * SESSION HELPER FUNCTIONS
 * Utility functions for session operations
 * ============================================
 */

/**
 * Calculate attendance summary for a session
 * Counts students by attendance status
 * 
 * @param {Array} attendances - Array of attendance records
 * @returns {Object} Summary with counts { present, absent, late, excused, total }
 */
const calculateSessionSummary = (attendances) => {
    const summary = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: attendances.length
    };

    attendances.forEach(attendance => {
        const status = attendance.status.toLowerCase();
        if (summary.hasOwnProperty(status)) {
            summary[status]++;
        }
    });

    return summary;
};

/**
 * Validate that a teacher owns/created a session
 * Throws error if unauthorized
 * 
 * @param {Object} session - Session object with createdBy field
 * @param {Number} teacherId - Teacher's profile ID
 * @throws {ResponseError} If teacher doesn't own the session
 */
const validateSessionOwnership = async (session, teacherId) => {
    if (session.createdBy !== teacherId) {
        throw new ResponseError(403, "Unauthorized to access this session");
    }
};

/**
 * Format session response for API
 * Adds computed fields and formats dates
 * 
 * @param {Object} session - Raw session object from database
 * @returns {Object} Formatted session object
 */
const formatSessionResponse = (session) => {
    return {
        sessionId: session.id,
        date: session.date,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        notes: session.notes,
        createdBy: session.createdBy
    };
};

/**
 * Group sessions by date
 * Useful for calendar views
 * 
 * @param {Array} sessions - Array of session objects
 * @returns {Object} Sessions grouped by date { 'YYYY-MM-DD': [sessions] }
 */
const groupSessionsByDate = (sessions) => {
    return sessions.reduce((acc, session) => {
        const dateKey = session.date.toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        
        acc[dateKey].push(session);
        return acc;
    }, {});
};

/**
 * Check if a session can be modified
 * Sessions that are completed or cancelled cannot be modified
 * 
 * @param {Object} session - Session object
 * @returns {Boolean} True if session can be modified
 * @throws {ResponseError} If session cannot be modified
 */
const validateSessionModifiable = (session) => {
    if (session.status === 'completed') {
        throw new ResponseError(400, "Cannot modify completed session");
    }
    
    if (session.status === 'cancelled') {
        throw new ResponseError(400, "Cannot modify cancelled session");
    }
    
    return true;
};

/**
 * Calculate session duration in minutes
 * 
 * @param {Date} startedAt - Session start time
 * @param {Date} endedAt - Session end time (can be null)
 * @returns {Number|null} Duration in minutes, or null if not ended
 */
const calculateSessionDuration = (startedAt, endedAt) => {
    if (!endedAt) {
        return null;
    }
    
    const durationMs = new Date(endedAt) - new Date(startedAt);
    return Math.round(durationMs / 1000 / 60); // Convert to minutes
};

/**
 * Get session status color for UI
 * Helper for frontend color coding
 * 
 * @param {String} status - Session status
 * @returns {String} Color code or name
 */
const getSessionStatusColor = (status) => {
    const colors = {
        'scheduled': 'gray',
        'ongoing': 'blue',
        'completed': 'green',
        'cancelled': 'red'
    };
    
    return colors[status] || 'gray';
};

/**
 * Validate session date
 * Checks if date is valid and not in the far future
 * 
 * @param {String} dateString - Date in YYYY-MM-DD format
 * @returns {Boolean} True if valid
 * @throws {ResponseError} If date is invalid
 */
const validateSessionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(today.getFullYear() + 1);
    
    if (isNaN(date.getTime())) {
        throw new ResponseError(400, "Invalid date format");
    }
    
    if (date > maxFutureDate) {
        throw new ResponseError(400, "Session date cannot be more than 1 year in the future");
    }
    
    return true;
};

/**
 * Get attendance rate for a session
 * Calculate percentage of students present
 * 
 * @param {Object} summary - Session summary object
 * @returns {Number} Attendance rate as percentage (0-100)
 */
const calculateAttendanceRate = (summary) => {
    if (summary.total === 0) {
        return 0;
    }
    
    const presentCount = summary.present + summary.late; // Late students still attended
    return Math.round((presentCount / summary.total) * 100);
};

export {
    calculateSessionSummary,
    validateSessionOwnership,
    formatSessionResponse,
    groupSessionsByDate,
    validateSessionModifiable,
    calculateSessionDuration,
    getSessionStatusColor,
    validateSessionDate,
    calculateAttendanceRate
};
