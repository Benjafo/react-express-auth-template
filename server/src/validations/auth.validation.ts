import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for authentication endpoints
 */
export const authValidation = {
    /**
     * Validation for user registration
     */
    register: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Email must be less than 255 characters'),
        body('password')
            .isLength({ min: 8, max: 128 })
            .withMessage('Password must be between 8 and 128 characters')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain at least one number')
            .matches(/[!@#$%^&*]/)
            .withMessage('Password must contain at least one special character'),
        body('confirmPassword')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Passwords do not match'),
    ] as ValidationChain[],

    /**
     * Validation for user login
     */
    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Email must be less than 255 characters'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ max: 128 })
            .withMessage('Password must be less than 128 characters'),
    ] as ValidationChain[],

    /**
     * Validation for forgot password
     */
    forgotPassword: [
        body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    ] as ValidationChain[],

    /**
     * Validation for reset password
     */
    resetPassword: [
        body('token').notEmpty().withMessage('Reset token is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain at least one number')
            .matches(/[!@#$%^&*]/)
            .withMessage('Password must contain at least one special character'),
        body('confirmPassword')
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage('Passwords do not match'),
    ] as ValidationChain[],

    /**
     * Validation for email verification
     */
    verifyEmail: [body('token').notEmpty().withMessage('Verification token is required')] as ValidationChain[],

    /**
     * Validation for token refresh
     */
    refresh: [body('refreshToken').notEmpty().withMessage('Refresh token is required')] as ValidationChain[],
};
