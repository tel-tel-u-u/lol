import Joi from "joi";

/**
 * ============================================
 * SESSION VALIDATION SCHEMAS
 * Using Joi for request validation
 * ============================================
 */

/**
 * Validation for creating a new session
 */
const createSessionSchema = Joi.object({
    classScheduleId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Class schedule ID must be a number',
            'number.positive': 'Class schedule ID must be positive',
            'any.required': 'Class schedule ID is required'
        }),
    
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'Date must be in YYYY-MM-DD format',
            'any.required': 'Date is required'
        }),
    
    notes: Joi.string()
        .max(500)
        .optional()
        .allow('', null)
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Profile ID is required'
        })
});

/**
 * Validation for getting a session
 */
const getSessionSchema = Joi.object({
    sessionId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Session ID must be a number',
            'number.positive': 'Session ID must be positive',
            'any.required': 'Session ID is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Profile ID is required'
        })
});

/**
 * Validation for getting sessions list
 */
const getSessionsListSchema = Joi.object({
    classScheduleId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Class schedule ID must be a number',
            'number.positive': 'Class schedule ID must be positive',
            'any.required': 'Class schedule ID is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Profile ID is required'
        })
});

/**
 * Validation for updating session status
 */
const updateSessionStatusSchema = Joi.object({
    sessionId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Session ID must be a number',
            'number.positive': 'Session ID must be positive',
            'any.required': 'Session ID is required'
        }),
    
    status: Joi.string()
        .valid('ongoing', 'completed', 'cancelled')
        .required()
        .messages({
            'any.only': 'Status must be one of: ongoing, completed, cancelled',
            'any.required': 'Status is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Profile ID is required'
        })
});

/**
 * Validation for ending a session
 */
const endSessionSchema = Joi.object({
    sessionId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Session ID must be a number',
            'number.positive': 'Session ID must be positive',
            'any.required': 'Session ID is required'
        }),
    
    profileId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'Profile ID is required'
        })
});

export {
    createSessionSchema,
    getSessionSchema,
    getSessionsListSchema,
    updateSessionStatusSchema,
    endSessionSchema
};
