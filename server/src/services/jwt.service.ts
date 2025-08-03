import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload, RefreshTokenPayload, AuthTokens } from '../types';
import { RefreshToken } from '../models/RefreshToken';
import { User } from '../models/User';

export class JWTService {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';

  /**
   * Generate access token
   */
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: '15m' });
  }

  /**
   * Generate refresh token
   */
  static async generateRefreshToken(user: User, deviceInfo?: Record<string, unknown>): Promise<string> {
    // Generate a unique token
    const tokenString = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry date (7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create refresh token in database
    const refreshToken = await RefreshToken.create({
      userId: user.id,
      token: tokenString,
      deviceInfo,
      expiresAt,
    });

    // Create JWT with reference to database token
    const payload: RefreshTokenPayload = {
      userId: user.id,
      tokenId: refreshToken.id,
    };

    return jwt.sign(payload, this.REFRESH_SECRET, { expiresIn: '7d' });
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokens(user: User, deviceInfo?: any): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, deviceInfo);

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;
    } catch (error: any) {
      throw new Error('Invalid or expired access token: ' + error.message);
    }
  }

  /**
   * Verify refresh token
   */
  static async verifyRefreshToken(token: string): Promise<RefreshToken> {
    try {
      // Verify JWT signature
      const payload = jwt.verify(token, this.REFRESH_SECRET) as RefreshTokenPayload;

      // Find token in database
      const refreshToken = await RefreshToken.findByPk(payload.tokenId, {
        include: [User],
      });

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      if (!refreshToken.isValid) {
        throw new Error('Refresh token has been invalidated');
      }

      if (refreshToken.isExpired()) {
        throw new Error('Refresh token has expired');
      }

      // Update last used timestamp
      await refreshToken.updateLastUsed();

      return refreshToken;
    } catch (error: any) {
      throw new Error('Invalid refresh token: ' + error.message);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshTokenString: string): Promise<AuthTokens> {
    const refreshToken = await this.verifyRefreshToken(refreshTokenString);
    const user = refreshToken.user;

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Invalidate old refresh token
    await refreshToken.invalidate();

    // Generate new tokens
    return this.generateTokens(user, refreshToken.deviceInfo);
  }

  /**
   * Invalidate all refresh tokens for a user
   */
  static async invalidateAllUserTokens(userId: number): Promise<void> {
    await RefreshToken.update(
      { isValid: false },
      { where: { userId, isValid: true } }
    );
  }

}