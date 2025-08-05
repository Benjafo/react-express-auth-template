import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import { csrf } from './middleware/csrf.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { configureSecurityHeaders, cspReportHandler } from './middleware/security.middleware';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    })
);

// Cookie parser middleware
app.use(cookieParser());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// CSRF protection - generate token for all requests
app.use(csrf.generate);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        },
    });
});

// Apply CSRF verification to API routes (excluding auth endpoints that don't need it)
app.use('/api/', csrf.exclude(['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/forgot-password']));

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
