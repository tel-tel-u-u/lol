/**
 * ============================================
 * DATE HELPER FUNCTIONS
 * Shared date utilities used across modules
 * ============================================
 */

/**
 * Get start of week (Monday) for a given date
 * 
 * @param {Date} date - Any date in the week
 * @returns {Date} Start of week (Monday)
 */
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

/**
 * Get end of week (Sunday) for a given date
 * 
 * @param {Date} date - Any date in the week
 * @returns {Date} End of week (Sunday)
 */
const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
};

/**
 * Convert JavaScript day (0-6) to Prisma day (1-7)
 * JS: 0=Sunday, 1=Monday, ... 6=Saturday
 * Prisma: 1=Monday, 2=Tuesday, ... 7=Sunday
 * 
 * @param {Number} jsDay - JavaScript day (0-6)
 * @returns {Number} Prisma day (1-7)
 */
const convertToPrismaDay = (jsDay) => {
    return jsDay === 0 ? 7 : jsDay;
};

/**
 * Convert Prisma day (1-7) to JavaScript day (0-6)
 * 
 * @param {Number} prismaDay - Prisma day (1-7)
 * @returns {Number} JavaScript day (0-6)
 */
const convertToJSDay = (prismaDay) => {
    return prismaDay === 7 ? 0 : prismaDay;
};

/**
 * Format date to YYYY-MM-DD string
 * 
 * @param {Date} date - Date to format
 * @returns {String} Formatted date string
 */
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format time to HH:MM:SS string
 * 
 * @param {Date} date - Date to extract time from
 * @returns {String} Formatted time string
 */
const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

/**
 * Check if date is in range (inclusive)
 * 
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {Boolean} True if date is in range
 */
const isDateInRange = (date, startDate, endDate) => {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return d >= start && d <= end;
};

/**
 * Get day of week name from day number
 * 
 * @param {Number} dayNumber - Day number (1-7 for Prisma, 0-6 for JS)
 * @param {Boolean} isPrisma - Whether input is Prisma format
 * @returns {String} Day name
 */
const getDayOfWeekName = (dayNumber, isPrisma = true) => {
    const days = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday'
    };

    if (!isPrisma) {
        dayNumber = convertToPrismaDay(dayNumber);
    }

    return days[dayNumber] || 'Unknown';
};

/**
 * Get all dates in a week
 * 
 * @param {Date} startDate - Start of week (Monday)
 * @returns {Array<Date>} Array of 7 dates
 */
const getWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
    }
    
    return dates;
};

/**
 * Get start of month
 * 
 * @param {Date} date - Any date in the month
 * @returns {Date} Start of month
 */
const getStartOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of month
 * 
 * @param {Date} date - Any date in the month
 * @returns {Date} End of month
 */
const getEndOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Add days to a date
 * 
 * @param {Date} date - Starting date
 * @param {Number} days - Number of days to add (can be negative)
 * @returns {Date} New date
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Get difference in days between two dates
 * 
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {Number} Difference in days
 */
const getDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if two dates are the same day
 * 
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {Boolean} True if same day
 */
const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

/**
 * Check if date is today
 * 
 * @param {Date} date - Date to check
 * @returns {Boolean} True if today
 */
const isToday = (date) => {
    return isSameDay(date, new Date());
};

/**
 * Check if date is weekend (Saturday or Sunday)
 * 
 * @param {Date} date - Date to check
 * @returns {Boolean} True if weekend
 */
const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
};

/**
 * Parse date string (YYYY-MM-DD) to Date object
 * 
 * @param {String} dateString - Date string
 * @returns {Date} Date object
 */
const parseDate = (dateString) => {
    return new Date(dateString);
};

/**
 * Validate date format YYYY-MM-DD
 * 
 * @param {String} dateString - Date string to validate
 * @returns {Boolean} True if valid format
 */
const isValidDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

/**
 * Get current academic year string
 * Example: "2024/2025" if current date is in second half of 2024
 * 
 * @param {Date} date - Current date
 * @returns {String} Academic year string
 */
const getAcademicYear = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // If after June, it's the next academic year
    if (month >= 7) {
        return `${year}/${year + 1}`;
    } else {
        return `${year - 1}/${year}`;
    }
};

export {
    getStartOfWeek,
    getEndOfWeek,
    convertToPrismaDay,
    convertToJSDay,
    formatDate,
    formatTime,
    isDateInRange,
    getDayOfWeekName,
    getWeekDates,
    getStartOfMonth,
    getEndOfMonth,
    addDays,
    getDaysDifference,
    isSameDay,
    isToday,
    isWeekend,
    parseDate,
    isValidDateFormat,
    getAcademicYear
};
