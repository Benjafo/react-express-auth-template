import helmet from 'helmet';
import { Application, Request, Response } from 'express';

/**
 * Configure comprehensive security headers using Helmet.js
 */
export function configureSecurityHeaders(app: Application): void {
    // Basic Helmet configuration with custom options
    app.use(
        helmet({
            // Content Security Policy
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for development
                    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                    sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin'],
                    reportUri: '/api/csp-report',
                    upgradeInsecureRequests: [],
                },
            },

            // Cross-Origin-Embedder-Policy
            crossOriginEmbedderPolicy: true,

            // Cross-Origin-Opener-Policy
            crossOriginOpenerPolicy: { policy: 'same-origin' },

            // Cross-Origin-Resource-Policy
            crossOriginResourcePolicy: { policy: 'same-origin' },

            // DNS Prefetch Control
            dnsPrefetchControl: { allow: false },

            // Frameguard (X-Frame-Options)
            frameguard: { action: 'deny' },

            // Hide Powered By
            hidePoweredBy: true,

            // HSTS (Strict-Transport-Security)
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true,
                preload: true,
            },

            // IE No Open
            ieNoOpen: true,

            // No Sniff (X-Content-Type-Options)
            noSniff: true,

            // Origin Agent Cluster
            originAgentCluster: true,

            // Permissions Policy
            permittedCrossDomainPolicies: false,

            // Referrer Policy
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

            // X-XSS-Protection (legacy, but still useful for older browsers)
            xssFilter: true,
        })
    );

    // Additional custom security headers
    app.use((_req, res, next) => {
        // Permissions Policy (formerly Feature Policy)
        res.setHeader(
            'Permissions-Policy',
            'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
        );

        // Cache Control for sensitive data
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        // Additional security headers
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
        res.setHeader('Expect-CT', 'max-age=86400, enforce');

        next();
    });
}

/**
 * CSP violation report endpoint
 */
export function cspReportHandler() {
    return (req: Request, res: Response): void => {
        if (req.body) {
            console.warn('CSP Violation:', req.body);
            // In production, you might want to send this to a logging service
        }
        res.status(204).end();
    };
}
