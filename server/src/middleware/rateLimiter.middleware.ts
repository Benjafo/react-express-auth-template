import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Create a standardized rate limit exceeded response
 */
const rateLimitResponse = (_req: Request, res: Response) => {
    res.status(429).json({
        success: false,
        error: {
            code: 'RATE001',
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: res.getHeader('Retry-After'),
        },
    });
};

/**
 * General API rate limiter
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    handler: rateLimitResponse,
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    skipSuccessfulRequests: true, // Don't count successful requests
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

/**
 * Very strict rate limiter for password reset endpoints
 */
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    skipSuccessfulRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

/**
 * Rate limiter for registration endpoint
 */
export const registrationLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registration attempts per hour
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

/**
 * Create custom rate limiter
 */
export const createRateLimiter = (windowMinutes: number, maxRequests: number, skipSuccessful: boolean = false): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        skipSuccessfulRequests: skipSuccessful,
        standardHeaders: true,
        legacyHeaders: false,
        handler: rateLimitResponse,
    });
};
