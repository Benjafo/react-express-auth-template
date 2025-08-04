import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JWTService } from '../services/jwt.service';
import { User } from '../models/User';

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH001',
                    message: 'No token provided',
                },
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = JWTService.verifyAccessToken(token);

        // Find user
        const user = await User.findByPk(payload.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH002',
                    message: 'User not found or inactive',
                },
            });
            return;
        }

        // Attach user to request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTH003',
                message: 'Invalid or expired token',
                details: [error instanceof Error ? error.message : 'Unknown error'],
            },
        });
    }
}

/**
 * Middleware to check if user has required role
 */
export function authorize(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH004',
                    message: 'Authentication required',
                },
            });
            return;
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'AUTH005',
                    message: 'Insufficient permissions',
                },
            });
            return;
        }

        next();
    };
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.substring(7);
        const payload = JWTService.verifyAccessToken(token);
        const user = await User.findByPk(payload.userId);

        if (user && user.isActive) {
            req.user = user;
            req.token = token;
        }
    } catch (error) {
        // Ignore errors for optional auth
    }

    next();
}
