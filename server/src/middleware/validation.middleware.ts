import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, matchedData } from 'express-validator';

/**
 * Middleware to handle validation errors and sanitize input
 */
export function validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));

        // Check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VAL001',
                    message: 'Validation failed',
                    details: errors.array().map((err) => ({
                        field: err.type === 'field' ? err.path : err.type,
                        message: err.msg,
                        value: err.type === 'field' ? err.value : undefined,
                    })),
                },
            });
            return;
        }

        // Extract only validated data
        const validatedData = matchedData(req, { includeOptionals: true });

        // Replace request body with validated and sanitized data
        if (req.method !== 'GET' && Object.keys(validatedData).length > 0) {
            req.body = validatedData;
        }

        next();
    };
}
