import { ResponseError } from "../error/response-error.js";

/**
 * ============================================
 * ATTENDANCE HELPER FUNCTIONS
 * Utility functions for attendance operations
 * ============================================
 */

/**
 * Calculate attendance percentage
 * Returns percentage of attendance (present + late) vs total
 * 
 * @param {Array} attendances - Array of attendance records
 * @returns {Number} Percentage (0-100)
 */
const calculateAttendancePercentage = (attendances) => {
    if (!attendances || attendances.length === 0) {
        return 0;
    }

    const presentCount = attendances.filter(
        a => a.status === 'present' || a.status === 'late'
    ).length;

    return Math.round((presentCount / attendances.length) * 100);
};

/**
 * Determine attendance status based on check-in time
 * Compares check-in time with scheduled start time
 * 
 * @param {Date} checkInTime - When student checked in
 * @param {Date} sessionDate - Date of the session
 * @param {String} scheduledStartTime - Scheduled start time (HH:MM:SS)
 * @param {Number} lateThresholdMinutes - Minutes after start to mark as late (default: 15)
 * @returns {String} Status: 'present' or 'late'
 */
const determineAttendanceStatus = (
    checkInTime, 
    sessionDate, 
    scheduledStartTime, 
    lateThresholdMinutes = 15
) => {
    // Combine session date with scheduled time
    const sessionDateStr = sessionDate.toISOString().split('T')[0];
    const scheduledDateTime = new Date(`${sessionDateStr}T${scheduledStartTime}`);
    
    // Add late threshold
    const lateThreshold = new Date(scheduledDateTime);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + lateThresholdMinutes);

    // Determine status
    if (checkInTime <= lateThreshold) {
        return 'present';
    } else {
        return 'late';
    }
};

/**
 * Validate session is active and modifiable
 * Throws error if session cannot be modified
 * 
 * @param {Object} session - Session object
 * @throws {ResponseError} If session cannot be modified
 */
const validateSessionActive = (session) => {
    if (session.status === 'completed') {
        throw new ResponseError(400, "Cannot modify attendance for completed session");
    }

    if (session.status === 'cancelled') {
        throw new ResponseError(400, "Cannot modify attendance for cancelled session");
    }

    return true;
};

/**
 * Format attendance record for API response
 * 
 * @param {Object} attendance - Raw attendance object
 * @returns {Object} Formatted attendance
 */
const formatAttendanceRecord = (attendance) => {
    return {
        id: attendance.id,
        studentId: attendance.studentId,
        studentName: attendance.student?.fullName,
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        attendanceMethod: attendance.attendanceMethod,
        faceConfidence: attendance.faceConfidence,
        notes: attendance.notes,
        markedBy: attendance.markedByTeacher?.fullName || null
    };
};

/**
 * Group attendances by status
 * 
 * @param {Array} attendances - Array of attendance records
 * @returns {Object} Grouped by status { present: [], absent: [], late: [], excused: [] }
 */
const groupAttendancesByStatus = (attendances) => {
    return attendances.reduce((acc, att) => {
        if (!acc[att.status]) {
            acc[att.status] = [];
        }
        acc[att.status].push(att);
        return acc;
    }, {
        present: [],
        absent: [],
        late: [],
        excused: []
    });
};

/**
 * Calculate attendance trends
 * Shows improvement/decline over time
 * 
 * @param {Array} attendances - Array sorted by date (oldest first)
 * @returns {Object} Trend analysis
 */
const calculateAttendanceTrends = (attendances) => {
    if (attendances.length < 2) {
        return { trend: 'insufficient_data', change: 0 };
    }

    // Split into two halves
    const midpoint = Math.floor(attendances.length / 2);
    const firstHalf = attendances.slice(0, midpoint);
    const secondHalf = attendances.slice(midpoint);

    // Calculate rates
    const firstRate = calculateAttendancePercentage(firstHalf);
    const secondRate = calculateAttendancePercentage(secondHalf);

    const change = secondRate - firstRate;

    let trend;
    if (change > 5) {
        trend = 'improving';
    } else if (change < -5) {
        trend = 'declining';
    } else {
        trend = 'stable';
    }

    return {
        trend,
        change: Math.round(change),
        firstHalfRate: firstRate,
        secondHalfRate: secondRate
    };
};

/**
 * Check if student qualifies for attendance warning
 * Based on attendance rate threshold
 * 
 * @param {Number} attendanceRate - Attendance percentage
 * @param {Number} warningThreshold - Threshold percentage (default: 75)
 * @returns {Boolean} True if warning needed
 */
const needsAttendanceWarning = (attendanceRate, warningThreshold = 75) => {
    return attendanceRate < warningThreshold;
};

/**
 * Get attendance status color for UI
 * 
 * @param {String} status - Attendance status
 * @returns {String} Color code
 */
const getAttendanceStatusColor = (status) => {
    const colors = {
        'present': 'green',
        'absent': 'red',
        'late': 'orange',
        'excused': 'blue'
    };
    return colors[status] || 'gray';
};

/**
 * Calculate late check-ins percentage
 * 
 * @param {Array} attendances - Array of attendance records
 * @returns {Number} Percentage of late check-ins
 */
const calculateLatePercentage = (attendances) => {
    if (!attendances || attendances.length === 0) {
        return 0;
    }

    const lateCount = attendances.filter(a => a.status === 'late').length;
    return Math.round((lateCount / attendances.length) * 100);
};

/**
 * Get most common attendance status
 * 
 * @param {Array} attendances - Array of attendance records
 * @returns {String} Most common status
 */
const getMostCommonStatus = (attendances) => {
    if (!attendances || attendances.length === 0) {
        return null;
    }

    const counts = attendances.reduce((acc, att) => {
        acc[att.status] = (acc[att.status] || 0) + 1;
        return acc;
    }, {});

    return Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
    );
};

/**
 * Generate attendance summary text
 * Human-readable summary
 * 
 * @param {Object} summary - Summary object with counts
 * @returns {String} Summary text
 */
const generateAttendanceSummaryText = (summary) => {
    const rate = calculateAttendancePercentage([
        ...Array(summary.present).fill({ status: 'present' }),
        ...Array(summary.late).fill({ status: 'late' }),
        ...Array(summary.absent).fill({ status: 'absent' }),
        ...Array(summary.excused).fill({ status: 'excused' })
    ]);

    let text = `Attendance rate: ${rate}%. `;
    text += `Present: ${summary.present}, `;
    text += `Absent: ${summary.absent}, `;
    text += `Late: ${summary.late}, `;
    text += `Excused: ${summary.excused}`;

    return text;
};

/**
 * Validate attendance data before update
 * Ensures data integrity
 * 
 * @param {Array} attendances - Array of attendance updates
 * @throws {ResponseError} If validation fails
 * @returns {Boolean} True if valid
 */
const validateAttendanceData = (attendances) => {
    if (!Array.isArray(attendances)) {
        throw new ResponseError(400, "Attendances must be an array");
    }

    if (attendances.length === 0) {
        throw new ResponseError(400, "At least one attendance record required");
    }

    const validStatuses = ['present', 'absent', 'late', 'excused'];
    
    for (const att of attendances) {
        if (!att.attendanceId) {
            throw new ResponseError(400, "Attendance ID is required");
        }

        if (!att.status || !validStatuses.includes(att.status)) {
            throw new ResponseError(400, "Valid status is required");
        }
    }

    return true;
};

/**
 * Calculate consecutive absences
 * Counts how many times in a row student was absent
 * 
 * @param {Array} attendances - Array sorted by date (newest first)
 * @returns {Number} Number of consecutive absences
 */
const calculateConsecutiveAbsences = (attendances) => {
    let count = 0;
    
    for (const att of attendances) {
        if (att.status === 'absent') {
            count++;
        } else {
            break;
        }
    }

    return count;
};

/**
 * Get attendance risk level
 * Based on attendance rate and consecutive absences
 * 
 * @param {Number} attendanceRate - Attendance percentage
 * @param {Number} consecutiveAbsences - Number of consecutive absences
 * @returns {String} Risk level: 'low', 'medium', 'high', 'critical'
 */
const getAttendanceRiskLevel = (attendanceRate, consecutiveAbsences) => {
    if (consecutiveAbsences >= 5 || attendanceRate < 50) {
        return 'critical';
    } else if (consecutiveAbsences >= 3 || attendanceRate < 70) {
        return 'high';
    } else if (consecutiveAbsences >= 2 || attendanceRate < 80) {
        return 'medium';
    } else {
        return 'low';
    }
};

/**
 * Format time difference
 * Shows how late/early student checked in
 * 
 * @param {Date} checkInTime - Actual check-in time
 * @param {Date} scheduledTime - Scheduled start time
 * @returns {String} Formatted difference (e.g., "5 minutes late")
 */
const formatTimeDifference = (checkInTime, scheduledTime) => {
    const diffMs = checkInTime - scheduledTime;
    const diffMinutes = Math.round(diffMs / 1000 / 60);

    if (diffMinutes === 0) {
        return "on time";
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} late`;
    } else {
        return `${Math.abs(diffMinutes)} minute${diffMinutes !== -1 ? 's' : ''} early`;
    }
};

export {
    calculateAttendancePercentage,
    determineAttendanceStatus,
    validateSessionActive,
    formatAttendanceRecord,
    groupAttendancesByStatus,
    calculateAttendanceTrends,
    needsAttendanceWarning,
    getAttendanceStatusColor,
    calculateLatePercentage,
    getMostCommonStatus,
    generateAttendanceSummaryText,
    validateAttendanceData,
    calculateConsecutiveAbsences,
    getAttendanceRiskLevel,
    formatTimeDifference
};
