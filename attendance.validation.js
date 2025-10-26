import Joi from "joi";

/**
 * ============================================
 * ATTENDANCE VALIDATION SCHEMAS
 * Using Joi for request validation
 * ============================================
 */

/**
 * Validation for marking attendance (bulk)
 */
const markAttendanceSchema = Joi.object({
    sessionId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Session ID is required'
        }),
    
    attendances: Joi.array()
        .items(
            Joi.object({
                attendanceId: Joi.number().integer().positive().required(),
                status: Joi.string()
                    .valid('present', 'absent', 'late', 'excused')
                    .required()
                    .messages({
                        'any.only': 'Status must be: present, absent, late, or excused'
                    }),
                notes: Joi.string().max(255).optional().allow(null, '')
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one attendance record is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
});

/**
 * Validation for marking single attendance
 */
const markSingleAttendanceSchema = Joi.object({
    attendanceId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Attendance ID is required'
        }),
    
    status: Joi.string()
        .valid('present', 'absent', 'late', 'excused')
        .required()
        .messages({
            'any.only': 'Status must be: present, absent, late, or excused',
            'any.required': 'Status is required'
        }),
    
    notes: Joi.string()
        .max(255)
        .optional()
        .allow(null, ''),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
});

/**
 * Validation for student check-in
 */
const studentCheckInSchema = Joi.object({
    sessionId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Session ID is required'
        }),
    
    studentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Student ID is required'
        }),
    
    method: Joi.string()
        .valid('face_recognition', 'manual')
        .optional()
        .default('face_recognition'),
    
    faceConfidence: Joi.number()
        .min(0)
        .max(1)
        .optional()
        .allow(null)
        .messages({
            'number.min': 'Face confidence must be between 0 and 1',
            'number.max': 'Face confidence must be between 0 and 1'
        })
});

/**
 * Validation for getting attendance by session
 */
const getAttendanceBySessionSchema = Joi.object({
    sessionId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Session ID is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    role: Joi.string()
        .valid('teacher', 'student', 'admin')
        .required()
});

/**
 * Validation for getting student attendance history
 */
const getStudentAttendanceHistorySchema = Joi.object({
    studentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Student ID is required'
        }),
    
    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Start date must be in YYYY-MM-DD format'
        }),
    
    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'End date must be in YYYY-MM-DD format'
        }),
    
    subjectId: Joi.number()
        .integer()
        .positive()
        .optional(),
    
    status: Joi.string()
        .valid('present', 'absent', 'late', 'excused')
        .optional()
});

/**
 * Validation for getting attendance summary
 */
const getAttendanceSummarySchema = Joi.object({
    type: Joi.string()
        .valid('class', 'teacher', 'student')
        .required()
        .messages({
            'any.only': 'Type must be: class, teacher, or student',
            'any.required': 'Type is required'
        }),
    
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'ID is required'
        }),
    
    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Start date must be in YYYY-MM-DD format'
        }),
    
    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'End date must be in YYYY-MM-DD format'
        })
});

/**
 * Validation for exporting attendance report
 */
const exportAttendanceReportSchema = Joi.object({
    classId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Class ID is required'
        }),
    
    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Start date must be in YYYY-MM-DD format',
            'any.required': 'Start date is required'
        }),
    
    endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'End date must be in YYYY-MM-DD format',
            'any.required': 'End date is required'
        }),
    
    format: Joi.string()
        .valid('json', 'csv', 'excel')
        .optional()
        .default('json')
});

export {
    markAttendanceSchema,
    markSingleAttendanceSchema,
    studentCheckInSchema,
    getAttendanceBySessionSchema,
    getStudentAttendanceHistorySchema,
    getAttendanceSummarySchema,
    exportAttendanceReportSchema
};
