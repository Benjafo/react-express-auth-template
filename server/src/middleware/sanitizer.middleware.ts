import { Request, Response, NextFunction } from 'express';
import { body, param, query, matchedData } from 'express-validator';

/**
 * Sanitize and validate request data
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
    // Remove any extra fields not defined in validation
    const data = matchedData(req, { includeOptionals: true });

    // Replace req.body with sanitized data
    if (Object.keys(data).length > 0) {
        req.body = data;
    }

    next();
};

/**
 * Common sanitizers for reuse
 */
export const commonSanitizers = {
    email: () => body('email').normalizeEmail().trim().toLowerCase(),

    username: () => body('username').trim().escape(),

    text: (field: string) => body(field).trim().escape(),

    url: (field: string) => body(field).trim().isURL().withMessage('Invalid URL format'),

    number: (field: string) => body(field).toInt(),

    boolean: (field: string) => body(field).toBoolean(),

    array: (field: string) => body(field).toArray(),

    // Sanitize common XSS vectors
    html: (field: string) =>
        body(field)
            .trim()
            .customSanitizer((value: string) => {
                // Remove script tags and event handlers
                return value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                    .replace(/javascript:/gi, '');
            }),
};

/**
 * Request size limiter middleware
 */
export const requestSizeLimiter = (maxSize: string = '10kb') => {
    return express.json({ limit: maxSize });
};

/**
 * Parameter pollution protection
 */
export const preventParameterPollution = (req: Request, _res: Response, next: NextFunction): void => {
    // Convert arrays to first value for non-array fields
    for (const key in req.query) {
        if (Array.isArray(req.query[key])) {
            req.query[key] = (req.query[key] as string[])[0];
        }
    }

    for (const key in req.body) {
        if (Array.isArray(req.body[key]) && !isExpectedArray(key)) {
            req.body[key] = req.body[key][0];
        }
    }

    next();
};

/**
 * Define which fields are expected to be arrays
 */
function isExpectedArray(fieldName: string): boolean {
    const arrayFields = ['permissions', 'roles', 'tags', 'categories'];
    return arrayFields.includes(fieldName);
}

/**
 * Sanitize path parameters
 */
export const sanitizeParams = {
    id: () => param('id').isUUID().withMessage('Invalid ID format'),

    numericId: () => param('id').isInt().toInt(),

    slug: () =>
        param('slug')
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Invalid slug format'),
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = {
    pagination: () => [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    ],

    search: () => query('search').optional().trim().escape(),

    sort: () => [
        query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'name', 'email']),
        query('sortOrder').optional().isIn(['asc', 'desc']),
    ],

    dateRange: () => [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate(),
    ],
};
