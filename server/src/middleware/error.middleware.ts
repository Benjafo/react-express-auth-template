import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import { ApiResponse } from '../types';

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error & {
        status?: number;
        code?: string;
        details?: unknown[];
        errors?: Array<{ path?: string; message: string }>;
    },
    _req: Request,
    res: Response<ApiResponse>,
    _next: NextFunction
): void {
    console.error('Error:', err);

    // Default error response
    let status = 500;
    let errorResponse: ApiResponse = {
        success: false,
        error: {
            code: 'SYS001',
            message: 'Internal server error',
        },
    };

    // Handle specific error types
    if (err.name === 'ValidationError' && err instanceof ValidationError) {
        status = 400;
        errorResponse = {
            success: false,
            error: {
                code: 'VAL001',
                message: 'Validation failed',
                details: err.errors.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            },
        };
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        status = 400;
        errorResponse = {
            success: false,
            error: {
                code: 'VAL002',
                message: 'Duplicate entry',
                details: err.errors?.map((e) => ({
                    field: e.path,
                    message: e.message,
                })),
            },
        };
    } else if (err.status) {
        // Custom errors with status code
        status = err.status;
        errorResponse = {
            success: false,
            error: {
                code: err.code || 'ERR001',
                message: err.message || 'An error occurred',
                details: err.details,
            },
        };
    } else if (err.message) {
        // Generic errors with message
        errorResponse = {
            success: false,
            error: {
                code: 'ERR001',
                message: err.message,
            },
        };
    }

    res.status(status).json(errorResponse);
}

/**
 * Not found handler
 */
export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
        },
    });
}
