<<<<<<< HEAD
import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AuthRequest, ApiResponse } from '../types';
=======
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { AuthController } from '../controllers/auth.controller';
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)

const router = Router();

/**
 * Validation rules for authentication
 */
const authValidation = {
  register: [
    body('email')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  login: [
    body('email')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  forgotPassword: [
    body('email')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
  ],
  resetPassword: [
    body('token')
      .notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('Passwords do not match'),
  ],
  verifyEmail: [
    body('token')
      .notEmpty().withMessage('Verification token is required'),
  ],
  refresh: [
    body('refreshToken')
      .notEmpty().withMessage('Refresh token is required'),
  ],
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate(authValidation.register),
<<<<<<< HEAD
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
        },
        message: 'Registration successful. Please check your email to verify your account.',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.register
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validate(authValidation.login),
<<<<<<< HEAD
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const { user, tokens } = await AuthService.login(
        req.body,
        ipAddress,
        userAgent
      );

      res.json({
        success: true,
        data: {
          user: user.toSafeObject(),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.login
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authenticate,
<<<<<<< HEAD
  async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      await AuthService.logout(req.user!.id, req.body.refreshToken);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.logout
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validate(authValidation.refresh),
<<<<<<< HEAD
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const tokens = await AuthService.refreshToken(req.body.refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.refreshToken
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * GET /api/auth/verify
 * Verify current access token
 */
router.get(
  '/verify',
  authenticate,
<<<<<<< HEAD
  async (req: AuthRequest, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      data: {
        valid: true,
        user: req.user!.toSafeObject(),
      },
    });
  }
=======
  AuthController.verify
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post(
  '/verify-email',
  validate(authValidation.verifyEmail),
<<<<<<< HEAD
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const user = await AuthService.verifyEmail(req.body.token);

      res.json({
        success: true,
        data: {
          email: user.email,
        },
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.verifyEmail
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
<<<<<<< HEAD
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      await AuthService.forgotPassword(req.body.email);

      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.forgotPassword
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

/**
 * POST /api/auth/reset-password
 * Reset password
 */
router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
<<<<<<< HEAD
  async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      await AuthService.resetPassword(
        req.body.token,
        req.body.newPassword,
        req.body.confirmPassword
      );

      res.json({
        success: true,
        message: 'Password reset successful. Please login with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }
=======
  AuthController.resetPassword
>>>>>>> 70d04d9 (task: modify server/src/routes/auth.routes.ts - 12:05,modify server/src/routes/auth.routes.ts - 12:03,modify PRD.md,server/src/controllers/ - 12:03, - 2025-08-04)
);

export default router;