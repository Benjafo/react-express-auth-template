import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CSRFRequest extends Request {
    csrfToken?: () => string;
}

/**
 * CSRF Protection using Double Submit Cookie pattern
 * More suitable for JWT-based authentication than synchronizer tokens
 */
export class CSRFProtection {
    private static readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN';
    private static readonly CSRF_HEADER_NAME = 'x-xsrf-token';
    private static readonly TOKEN_LENGTH = 32;

    /**
     * Generate a new CSRF token
     */
    private static generateToken(): string {
        return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
    }

    /**
     * Middleware to generate and set CSRF token cookie
     */
    static generateToken() {
        return (req: CSRFRequest, res: Response, next: NextFunction): void => {
            // Check if token already exists
            let token = req.cookies?.[this.CSRF_COOKIE_NAME];

            // Generate new token if not exists
            if (!token) {
                token = this.generateToken();
                res.cookie(this.CSRF_COOKIE_NAME, token, {
                    httpOnly: false, // Must be accessible by JavaScript
                    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                });
            }

            // Add helper method to request
            req.csrfToken = () => token;

            next();
        };
    }

    /**
     * Middleware to verify CSRF token
     * Skip for safe methods (GET, HEAD, OPTIONS)
     */
    static verifyToken() {
        return (req: Request, res: Response, next: NextFunction): void => {
            // Skip CSRF check for safe methods
            if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                return next();
            }

            // Get token from cookie
            const cookieToken = req.cookies?.[this.CSRF_COOKIE_NAME];

            // Get token from header or body
            const submittedToken = req.headers[this.CSRF_HEADER_NAME] || req.body?._csrf || req.query?._csrf;

            // Validate tokens
            if (!cookieToken || !submittedToken) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: 'CSRF001',
                        message: 'CSRF token missing',
                    },
                });
                return;
            }

            // Compare tokens using timing-safe comparison
            if (!this.timingSafeEqual(cookieToken, submittedToken)) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: 'CSRF002',
                        message: 'Invalid CSRF token',
                    },
                });
                return;
            }

            next();
        };
    }

    /**
     * Timing-safe string comparison
     */
    private static timingSafeEqual(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        const bufferA = Buffer.from(a);
        const bufferB = Buffer.from(b);

        return crypto.timingSafeEqual(bufferA, bufferB);
    }

    /**
     * Helper middleware to exclude specific routes from CSRF protection
     */
    static exclude(paths: string[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            // Skip CSRF verification for excluded paths
            if (paths.some((path) => req.path.startsWith(path))) {
                return next();
            }

            // Apply CSRF verification
            this.verifyToken()(req, res, next);
        };
    }
}

/**
 * CSRF middleware configuration
 */
export const csrf = {
    generate: CSRFProtection.generateToken(),
    verify: CSRFProtection.verifyToken(),
    exclude: (paths: string[]) => CSRFProtection.exclude(paths),
};
