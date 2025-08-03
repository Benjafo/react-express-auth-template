import { Request } from 'express';
import { User } from '../models/User';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: number;
}

export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}