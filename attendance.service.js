import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { validate } from "../validation/validation.js";
import {
    markAttendanceSchema,
    markSingleAttendanceSchema,
    studentCheckInSchema,
    getAttendanceBySessionSchema,
    getStudentAttendanceHistorySchema,
    getAttendanceSummarySchema,
    exportAttendanceReportSchema
} from "../validations/attendance.validation.js";
import {
    calculateAttendancePercentage,
    determineAttendanceStatus,
    validateSessionActive
} from "../helpers/attendance.helper.js";

/**
 * ============================================
 * ATTENDANCE SERVICE
 * Handles all attendance-related business logic
 * ============================================
 */

/**
 * Mark attendance (Bulk update)
 * Teacher marks multiple students at once for a session
 */
const markAttendance = async (request) => {
    const validated = validate(markAttendanceSchema, request);
    const { sessionId, attendances, profileId } = validated;

    // Validate session and ownership
    const session = await prismaClient.attendanceSession.findUnique({
        where: { id: sessionId },
        include: {
            classSchedule: {
                select: {
                    class: { select: { name: true } },
                    subject: { select: { name: true } }
                }
            }
        }
    });

    if (!session) {
        throw new ResponseError(404, "Session not found");
    }

    if (session.createdBy !== profileId) {
        throw new ResponseError(403, "Unauthorized to mark attendance for this session");
    }

    // Validate session is modifiable
    validateSessionActive(session);

    // Update attendances in transaction
    const result = await prismaClient.$transaction(
        attendances.map(att =>
            prismaClient.attendance.update({
                where: {
                    id: att.attendanceId,
                    attendanceSessionId: sessionId
                },
                data: {
                    status: att.status,
                    checkInTime: att.status !== 'absent' ? new Date() : null,
                    attendanceMethod: 'manual',
                    markedBy: profileId,
                    notes: att.notes || null,
                    updatedAt: new Date()
                }
            })
        )
    );

    return {
        message: "Attendance marked successfully",
        sessionId: sessionId,
        updated: result.length,
        className: session.classSchedule.class.name,
        subject: session.classSchedule.subject.name
    };
};

/**
 * Mark single attendance
 * Update one student's attendance status
 */
const markSingleAttendance = async (request) => {
    const validated = validate(markSingleAttendanceSchema, request);
    const { attendanceId, status, notes, profileId } = validated;

    // Get attendance with session info
    const attendance = await prismaClient.attendance.findUnique({
        where: { id: attendanceId },
        include: {
            attendanceSession: {
                include: {
                    classSchedule: {
                        select: {
                            class: { select: { name: true } },
                            subject: { select: { name: true } }
                        }
                    }
                }
            },
            student: {
                select: { fullName: true, studentId: true }
            }
        }
    });

    if (!attendance) {
        throw new ResponseError(404, "Attendance record not found");
    }

    // Validate ownership
    if (attendance.attendanceSession.createdBy !== profileId) {
        throw new ResponseError(403, "Unauthorized to modify this attendance");
    }

    // Validate session is modifiable
    validateSessionActive(attendance.attendanceSession);

    // Update attendance
    const updated = await prismaClient.attendance.update({
        where: { id: attendanceId },
        data: {
            status: status,
            checkInTime: status !== 'absent' ? new Date() : null,
            attendanceMethod: 'manual',
            markedBy: profileId,
            notes: notes || null,
            updatedAt: new Date()
        }
    });

    return {
        message: "Attendance updated successfully",
        attendance: {
            id: updated.id,
            studentName: attendance.student.fullName,
            studentNumber: attendance.student.studentId,
            status: updated.status,
            checkInTime: updated.checkInTime,
            notes: updated.notes,
            className: attendance.attendanceSession.classSchedule.class.name,
            subject: attendance.attendanceSession.classSchedule.subject.name
        }
    };
};

/**
 * Student self check-in
 * Student marks their own attendance (via face recognition or manual)
 */
const studentCheckIn = async (request) => {
    const validated = validate(studentCheckInSchema, request);
    const { sessionId, studentId, method, faceConfidence } = validated;

    // Get session and check if ongoing
    const session = await prismaClient.attendanceSession.findUnique({
        where: { id: sessionId },
        include: {
            classSchedule: {
                select: {
                    startTime: true,
                    endTime: true,
                    class: { select: { name: true } },
                    subject: { select: { name: true } }
                }
            }
        }
    });

    if (!session) {
        throw new ResponseError(404, "Session not found");
    }

    if (session.status !== 'ongoing') {
        throw new ResponseError(400, "Session is not active for check-in");
    }

    // Get student's attendance record
    const attendance = await prismaClient.attendance.findFirst({
        where: {
            attendanceSessionId: sessionId,
            studentId: studentId
        },
        include: {
            student: {
                select: { fullName: true, studentId: true }
            }
        }
    });

    if (!attendance) {
        throw new ResponseError(404, "Attendance record not found for this session");
    }

    // Check if already checked in
    if (attendance.status !== 'absent') {
        throw new ResponseError(400, "Already checked in for this session");
    }

    // Determine status based on check-in time
    const now = new Date();
    const scheduleStartTime = session.classSchedule.startTime;
    const status = determineAttendanceStatus(now, session.date, scheduleStartTime);

    // Update attendance
    const updated = await prismaClient.attendance.update({
        where: { id: attendance.id },
        data: {
            status: status,
            checkInTime: now,
            attendanceMethod: method || 'face_recognition',
            faceConfidence: faceConfidence || null,
            updatedAt: now
        }
    });

    return {
        message: status === 'late' 
            ? "Checked in successfully (marked as late)"
            : "Checked in successfully",
        attendance: {
            id: updated.id,
            studentName: attendance.student.fullName,
            studentNumber: attendance.student.studentId,
            status: updated.status,
            checkInTime: updated.checkInTime,
            method: updated.attendanceMethod,
            className: session.classSchedule.class.name,
            subject: session.classSchedule.subject.name
        }
    };
};

/**
 * Get attendance by session
 * Returns all attendance records for a specific session
 */
const getAttendanceBySession = async (request) => {
    const validated = validate(getAttendanceBySessionSchema, request);
    const { sessionId, profileId, role } = validated;

    // Get session with all attendances
    const session = await prismaClient.attendanceSession.findUnique({
        where: { id: sessionId },
        include: {
            classSchedule: {
                select: {
                    class: { select: { name: true } },
                    subject: { select: { name: true } },
                    teacher: { select: { fullName: true } }
                }
            },
            attendances: {
                include: {
                    student: {
                        select: {
                            id: true,
                            fullName: true,
                            studentId: true
                        }
                    },
                    markedByTeacher: {
                        select: {
                            fullName: true
                        }
                    }
                },
                orderBy: {
                    student: {
                        fullName: 'asc'
                    }
                }
            }
        }
    });

    if (!session) {
        throw new ResponseError(404, "Session not found");
    }

    // Authorization check for teachers
    if (role === 'teacher' && session.createdBy !== profileId) {
        throw new ResponseError(403, "Unauthorized to view this session's attendance");
    }

    // Calculate summary
    const summary = {
        total: session.attendances.length,
        present: session.attendances.filter(a => a.status === 'present').length,
        absent: session.attendances.filter(a => a.status === 'absent').length,
        late: session.attendances.filter(a => a.status === 'late').length,
        excused: session.attendances.filter(a => a.status === 'excused').length
    };

    return {
        session: {
            id: session.id,
            date: session.date,
            status: session.status,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            className: session.classSchedule.class.name,
            subject: session.classSchedule.subject.name,
            teacher: session.classSchedule.teacher.fullName
        },
        summary: summary,
        attendances: session.attendances.map(a => ({
            id: a.id,
            studentId: a.student.id,
            studentName: a.student.fullName,
            studentNumber: a.student.studentId,
            status: a.status,
            checkInTime: a.checkInTime,
            attendanceMethod: a.attendanceMethod,
            faceConfidence: a.faceConfidence,
            markedBy: a.markedByTeacher?.fullName || null,
            notes: a.notes
        }))
    };
};

/**
 * Get student attendance history
 * Returns attendance records for a specific student
 */
const getStudentAttendanceHistory = async (request) => {
    const validated = validate(getStudentAttendanceHistorySchema, request);
    const { studentId, startDate, endDate, subjectId, status } = validated;

    // Build where clause
    const whereClause = {
        studentId: studentId
    };

    if (startDate || endDate) {
        whereClause.attendanceSession = {
            date: {}
        };
        if (startDate) {
            whereClause.attendanceSession.date.gte = new Date(startDate);
        }
        if (endDate) {
            whereClause.attendanceSession.date.lte = new Date(endDate);
        }
    }

    if (subjectId) {
        if (!whereClause.attendanceSession) {
            whereClause.attendanceSession = {};
        }
        whereClause.attendanceSession.classSchedule = {
            subjectId: subjectId
        };
    }

    if (status) {
        whereClause.status = status;
    }

    // Get attendance records
    const attendances = await prismaClient.attendance.findMany({
        where: whereClause,
        include: {
            attendanceSession: {
                select: {
                    date: true,
                    status: true,
                    classSchedule: {
                        select: {
                            subject: { select: { name: true, code: true } },
                            teacher: { select: { fullName: true } },
                            class: { select: { name: true } }
                        }
                    }
                }
            }
        },
        orderBy: {
            attendanceSession: {
                date: 'desc'
            }
        }
    });

    // Get student info
    const student = await prismaClient.student.findUnique({
        where: { id: studentId },
        select: {
            fullName: true,
            studentId: true,
            class: { select: { name: true } }
        }
    });

    if (!student) {
        throw new ResponseError(404, "Student not found");
    }

    // Calculate summary
    const summary = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        excused: attendances.filter(a => a.status === 'excused').length,
        attendanceRate: calculateAttendancePercentage(attendances)
    };

    return {
        student: {
            id: studentId,
            name: student.fullName,
            studentNumber: student.studentId,
            className: student.class.name
        },
        filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            subjectId: subjectId || null,
            status: status || null
        },
        summary: summary,
        attendances: attendances.map(a => ({
            id: a.id,
            date: a.attendanceSession.date,
            status: a.status,
            checkInTime: a.checkInTime,
            subject: a.attendanceSession.classSchedule.subject.name,
            subjectCode: a.attendanceSession.classSchedule.subject.code,
            teacher: a.attendanceSession.classSchedule.teacher.fullName,
            className: a.attendanceSession.classSchedule.class.name,
            sessionStatus: a.attendanceSession.status,
            notes: a.notes
        }))
    };
};

/**
 * Get attendance summary
 * Statistics and overview for a class, teacher, or student
 */
const getAttendanceSummary = async (request) => {
    const validated = validate(getAttendanceSummarySchema, request);
    const { type, id, startDate, endDate } = validated;

    const dateFilter = {};
    if (startDate || endDate) {
        dateFilter.date = {};
        if (startDate) dateFilter.date.gte = new Date(startDate);
        if (endDate) dateFilter.date.lte = new Date(endDate);
    }

    let whereClause = {};
    let groupInfo = {};

    if (type === 'class') {
        // Summary for entire class
        const classData = await prismaClient.class.findUnique({
            where: { id: id },
            select: { name: true, gradeLevel: true }
        });

        if (!classData) {
            throw new ResponseError(404, "Class not found");
        }

        whereClause = {
            attendanceSession: {
                classSchedule: {
                    classId: id
                },
                ...dateFilter
            }
        };

        groupInfo = {
            type: 'class',
            name: classData.name,
            gradeLevel: classData.gradeLevel
        };

    } else if (type === 'teacher') {
        // Summary for teacher's sessions
        const teacher = await prismaClient.teacher.findUnique({
            where: { id: id },
            select: { fullName: true }
        });

        if (!teacher) {
            throw new ResponseError(404, "Teacher not found");
        }

        whereClause = {
            attendanceSession: {
                createdBy: id,
                ...dateFilter
            }
        };

        groupInfo = {
            type: 'teacher',
            name: teacher.fullName
        };

    } else if (type === 'student') {
        // Summary for specific student
        const student = await prismaClient.student.findUnique({
            where: { id: id },
            select: {
                fullName: true,
                studentId: true,
                class: { select: { name: true } }
            }
        });

        if (!student) {
            throw new ResponseError(404, "Student not found");
        }

        whereClause = {
            studentId: id,
            attendanceSession: dateFilter
        };

        groupInfo = {
            type: 'student',
            name: student.fullName,
            studentNumber: student.studentId,
            className: student.class.name
        };
    }

    // Get attendance data
    const attendances = await prismaClient.attendance.findMany({
        where: whereClause,
        select: {
            status: true,
            attendanceSession: {
                select: {
                    date: true,
                    classSchedule: {
                        select: {
                            subject: { select: { name: true } }
                        }
                    }
                }
            }
        }
    });

    // Calculate summary
    const summary = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        excused: attendances.filter(a => a.status === 'excused').length,
        attendanceRate: calculateAttendancePercentage(attendances)
    };

    // Group by subject
    const bySubject = attendances.reduce((acc, att) => {
        const subject = att.attendanceSession.classSchedule.subject.name;
        if (!acc[subject]) {
            acc[subject] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
        }
        acc[subject][att.status]++;
        acc[subject].total++;
        return acc;
    }, {});

    return {
        info: groupInfo,
        filters: {
            startDate: startDate || null,
            endDate: endDate || null
        },
        summary: summary,
        bySubject: bySubject
    };
};

/**
 * Export attendance report
 * Generate detailed attendance report for export
 */
const exportAttendanceReport = async (request) => {
    const validated = validate(exportAttendanceReportSchema, request);
    const { classId, startDate, endDate, format } = validated;

    // Get class info
    const classData = await prismaClient.class.findUnique({
        where: { id: classId },
        include: {
            schoolLevel: { select: { name: true } },
            students: {
                select: {
                    id: true,
                    fullName: true,
                    studentId: true
                },
                orderBy: {
                    fullName: 'asc'
                }
            }
        }
    });

    if (!classData) {
        throw new ResponseError(404, "Class not found");
    }

    // Get all sessions in date range
    const sessions = await prismaClient.attendanceSession.findMany({
        where: {
            classSchedule: {
                classId: classId
            },
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        include: {
            classSchedule: {
                select: {
                    subject: { select: { name: true, code: true } }
                }
            },
            attendances: {
                select: {
                    studentId: true,
                    status: true,
                    checkInTime: true
                }
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    // Build report data
    const reportData = {
        class: {
            name: classData.name,
            gradeLevel: classData.gradeLevel,
            schoolLevel: classData.schoolLevel.name
        },
        period: {
            startDate: startDate,
            endDate: endDate
        },
        students: classData.students.map(student => {
            // Get student's attendances
            const studentAttendances = sessions.map(session => {
                const att = session.attendances.find(a => a.studentId === student.id);
                return {
                    date: session.date,
                    subject: session.classSchedule.subject.name,
                    status: att?.status || 'absent',
                    checkInTime: att?.checkInTime || null
                };
            });

            // Calculate summary
            const summary = {
                total: studentAttendances.length,
                present: studentAttendances.filter(a => a.status === 'present').length,
                absent: studentAttendances.filter(a => a.status === 'absent').length,
                late: studentAttendances.filter(a => a.status === 'late').length,
                excused: studentAttendances.filter(a => a.status === 'excused').length
            };
            summary.attendanceRate = calculateAttendancePercentage(
                studentAttendances.map(a => ({ status: a.status }))
            );

            return {
                id: student.id,
                name: student.fullName,
                studentNumber: student.studentId,
                attendances: studentAttendances,
                summary: summary
            };
        }),
        totalSessions: sessions.length,
        format: format || 'json'
    };

    return reportData;
};

/**
 * Get attendance analytics
 * Detailed analytics and trends
 */
const getAttendanceAnalytics = async (filters) => {
    const { classId, startDate, endDate, groupBy } = filters;

    const dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
    };

    const attendances = await prismaClient.attendance.findMany({
        where: {
            attendanceSession: {
                classSchedule: {
                    classId: classId
                },
                date: dateFilter
            }
        },
        include: {
            attendanceSession: {
                select: {
                    date: true,
                    classSchedule: {
                        select: {
                            subject: { select: { name: true } },
                            dayOfWeek: true
                        }
                    }
                }
            }
        }
    });

    // Overall statistics
    const overall = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        late: attendances.filter(a => a.status === 'late').length,
        excused: attendances.filter(a => a.status === 'excused').length,
        attendanceRate: calculateAttendancePercentage(attendances)
    };

    // Trends over time
    const trends = {};
    if (groupBy === 'day' || groupBy === 'week') {
        attendances.forEach(att => {
            const dateKey = att.attendanceSession.date.toISOString().split('T')[0];
            if (!trends[dateKey]) {
                trends[dateKey] = { present: 0, absent: 0, late: 0, excused: 0 };
            }
            trends[dateKey][att.status]++;
        });
    }

    // By subject
    const bySubject = attendances.reduce((acc, att) => {
        const subject = att.attendanceSession.classSchedule.subject.name;
        if (!acc[subject]) {
            acc[subject] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
        }
        acc[subject][att.status]++;
        acc[subject].total++;
        return acc;
    }, {});

    // By day of week
    const byDayOfWeek = attendances.reduce((acc, att) => {
        const day = att.attendanceSession.classSchedule.dayOfWeek;
        if (!acc[day]) {
            acc[day] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
        }
        acc[day][att.status]++;
        acc[day].total++;
        return acc;
    }, {});

    return {
        overall,
        trends,
        bySubject,
        byDayOfWeek,
        period: { startDate, endDate }
    };
};

export default {
    markAttendance,
    markSingleAttendance,
    studentCheckIn,
    getAttendanceBySession,
    getStudentAttendanceHistory,
    getAttendanceSummary,
    exportAttendanceReport,
    getAttendanceAnalytics
};
