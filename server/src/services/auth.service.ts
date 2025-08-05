import { User } from '../models/User';
import { LoginAttempt } from '../models/LoginAttempt';
import { JWTService } from './jwt.service';
import { LoginCredentials, RegisterCredentials, AuthTokens } from '../types';
import crypto from 'crypto';

export class AuthService {
    /**
     * Register a new user
     */
    static async register(credentials: RegisterCredentials): Promise<User> {
        const { email, password, confirmPassword } = credentials;

        // Check if passwords match
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create user with email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            email,
            password,
            emailVerificationToken,
            emailVerificationExpires,
        });

        // TODO: Send verification email

        return user;
    }

    /**
     * Login user
     */
    static async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{ user: User; tokens: AuthTokens }> {
        const { email, password } = credentials;

        // Find user
        const user = await User.findOne({ where: { email } });

        // Record login attempt (even if user doesn't exist)
        await LoginAttempt.recordAttempt(email, ipAddress, userAgent, false);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if account is locked
        if (user.isLocked()) {
            throw new Error('Account is locked due to too many failed login attempts');
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await user.incrementLoginAttempts();
            throw new Error('Invalid credentials');
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            throw new Error('Please verify your email before logging in');
        }

        // Check if account is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Update login attempt as successful
        await LoginAttempt.recordAttempt(email, ipAddress, userAgent, true);

        // Generate tokens
        const deviceInfo = { ipAddress, userAgent };
        const tokens = await JWTService.generateTokens(user, deviceInfo);

        return { user, tokens };
    }

    /**
     * Logout user
     */
    static async logout(userId: number, refreshToken?: string): Promise<void> {
        if (refreshToken) {
            try {
                const token = await JWTService.verifyRefreshToken(refreshToken);
                await token.invalidate();
            } catch (error) {
                // Ignore errors - token might already be invalid
            }
        } else {
            // Invalidate all tokens for the user
            await JWTService.invalidateAllUserTokens(userId);
        }
    }

    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken: string): Promise<AuthTokens> {
        return JWTService.refreshAccessToken(refreshToken);
    }

    /**
     * Verify email
     */
    static async verifyEmail(token: string): Promise<User> {
        const user = await User.findOne({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            throw new Error('Invalid verification token');
        }

        if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
            throw new Error('Verification token has expired');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return user;
    }

    /**
     * Request password reset
     */
    static async forgotPassword(email: string): Promise<void> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Don't reveal if user exists
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();

        // TODO: Send password reset email
    }

    /**
     * Reset password
     */
    static async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<User> {
        if (newPassword !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const user = await User.findOne({
            where: { passwordResetToken: token },
        });

        if (!user) {
            throw new Error('Invalid reset token');
        }

        if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
            throw new Error('Reset token has expired');
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Invalidate all refresh tokens
        await JWTService.invalidateAllUserTokens(user.id);

        return user;
    }
}
