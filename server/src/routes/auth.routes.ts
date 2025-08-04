
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authValidation } from '../validations/auth.validation';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(authValidation.register), AuthController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(authValidation.login), AuthController.login);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', validate(authValidation.refresh), AuthController.refreshToken);

/**
 * GET /api/auth/verify
 * Verify current access token
 */
router.get('/verify', authenticate, AuthController.verify);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post('/verify-email', validate(authValidation.verifyEmail), AuthController.verifyEmail);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', validate(authValidation.forgotPassword), AuthController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password
 */
router.post('/reset-password', validate(authValidation.resetPassword), AuthController.resetPassword);

export default router;