import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest, ApiResponse } from '../types';

/**
 * Authentication controller handling all auth-related HTTP requests
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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

  /**
   * Login user
   */
  static async login(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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

  /**
   * Logout user
   */
  static async logout(req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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

  /**
   * Verify current access token
   */
  static async verify(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      data: {
        valid: true,
        user: req.user!.toSafeObject(),
      },
    });
  }

  /**
   * Verify email address
   */
  static async verifyEmail(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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

  /**
   * Request password reset
   */
  static async forgotPassword(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
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
}