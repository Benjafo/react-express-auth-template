import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload, RefreshTokenPayload, AuthTokens } from '../types';
import { RefreshToken } from '../models/RefreshToken';
import { User } from '../models/User';

export class JWTService {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  private static readonly ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
  private static readonly REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

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
  static async generateRefreshToken(user: User, deviceInfo?: any): Promise<string> {
    // Generate a unique token
    const tokenString = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiry date
    const expiryMs = this.parseExpiry(this.REFRESH_EXPIRY);
    const expiresAt = new Date(Date.now() + expiryMs);

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

    const options = {
      expiresIn: this.REFRESH_EXPIRY,
    };
    return jwt.sign(payload, this.REFRESH_SECRET, options);
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

  /**
   * Parse expiry string to milliseconds
   */
  private static parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error('Invalid expiry format');
    }

    const [, value, unit] = match;
    const num = parseInt(value);

    switch (unit) {
      case 's': return num * 1000;
      case 'm': return num * 60 * 1000;
      case 'h': return num * 60 * 60 * 1000;
      case 'd': return num * 24 * 60 * 60 * 1000;
      default: throw new Error('Invalid expiry unit');
    }
  }
}