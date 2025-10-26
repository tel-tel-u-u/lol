import Joi from "joi";

/**
 * ============================================
 * SCHEDULE VALIDATION SCHEMAS
 * Using Joi for request validation
 * ============================================
 */

/**
 * Validation for getting schedule by date
 */
const getScheduleByDateSchema = Joi.object({
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Date must be in YYYY-MM-DD format',
            'any.required': 'Date is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    role: Joi.string()
        .valid('teacher', 'student')
        .required()
});

/**
 * Validation for getting weekly schedule
 */
const getWeeklyScheduleSchema = Joi.object({
    startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Start date must be in YYYY-MM-DD format'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    role: Joi.string()
        .valid('teacher', 'student')
        .required()
});

/**
 * Validation for getting schedule by academic period
 */
const getScheduleByAcademicPeriodSchema = Joi.object({
    academicPeriodId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Academic period ID is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    role: Joi.string()
        .valid('teacher', 'student')
        .required(),
    
    classId: Joi.number()
        .integer()
        .positive()
        .optional()
});

/**
 * Validation for getting teacher schedules
 */
const getTeacherSchedulesSchema = Joi.object({
    teacherId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    academicPeriodId: Joi.number()
        .integer()
        .positive()
        .optional(),
    
    isActive: Joi.boolean()
        .optional()
});

/**
 * Validation for creating schedule
 */
const createScheduleSchema = Joi.object({
    classId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Class ID is required'
        }),
    
    subjectId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Subject ID is required'
        }),
    
    teacherId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Teacher ID is required'
        }),
    
    dayOfWeek: Joi.number()
        .integer()
        .min(1)
        .max(7)
        .required()
        .messages({
            'number.min': 'Day of week must be between 1 (Monday) and 7 (Sunday)',
            'number.max': 'Day of week must be between 1 (Monday) and 7 (Sunday)',
            'any.required': 'Day of week is required'
        }),
    
    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .required()
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM:SS format',
            'any.required': 'Start time is required'
        }),
    
    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .required()
        .messages({
            'string.pattern.base': 'End time must be in HH:MM:SS format',
            'any.required': 'End time is required'
        }),
    
    room: Joi.string()
        .max(50)
        .optional()
        .allow(null, ''),
    
    academicPeriodId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Academic period ID is required'
        })
});

/**
 * Validation for updating schedule
 */
const updateScheduleSchema = Joi.object({
    scheduleId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    updates: Joi.object({
        classId: Joi.number().integer().positive().optional(),
        subjectId: Joi.number().integer().positive().optional(),
        teacherId: Joi.number().integer().positive().optional(),
        dayOfWeek: Joi.number().integer().min(1).max(7).optional(),
        startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional(),
        endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional(),
        room: Joi.string().max(50).optional().allow(null, ''),
        academicPeriodId: Joi.number().integer().positive().optional(),
        isActive: Joi.boolean().optional()
    }).min(1).required()
        .messages({
            'object.min': 'At least one field must be provided for update'
        })
});

/**
 * Validation for deleting schedule
 */
const deleteScheduleSchema = Joi.object({
    scheduleId: Joi.number()
        .integer()
        .positive()
        .required(),
    
    softDelete: Joi.boolean()
        .default(true)
        .optional()
});

/**
 * Validation for bulk creating schedules
 */
const bulkCreateSchedulesSchema = Joi.object({
    schedules: Joi.array()
        .items(
            Joi.object({
                classId: Joi.number().integer().positive().required(),
                subjectId: Joi.number().integer().positive().required(),
                teacherId: Joi.number().integer().positive().required(),
                dayOfWeek: Joi.number().integer().min(1).max(7).required(),
                startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
                endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
                room: Joi.string().max(50).optional().allow(null, ''),
                academicPeriodId: Joi.number().integer().positive().required()
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one schedule must be provided',
            'any.required': 'Schedules array is required'
        })
});

export {
    getScheduleByDateSchema,
    getWeeklyScheduleSchema,
    getScheduleByAcademicPeriodSchema,
    getTeacherSchedulesSchema,
    createScheduleSchema,
    updateScheduleSchema,
    deleteScheduleSchema,
    bulkCreateSchedulesSchema
};
