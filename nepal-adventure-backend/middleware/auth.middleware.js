/**
 * Advanced Authentication Middleware
 * Enterprise-grade security for production
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const crypto = require('crypto');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

// Token blacklist for logout functionality
const tokenBlacklist = new Set();

// Rate limiting configurations
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Generate tokens
const generateTokens = (userId, role = 'user') => {
    const payload = {
        userId,
        role,
        iat: Date.now(),
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE,
        issuer: 'nepal-adventures',
        audience: 'nepal-adventures-api',
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRE,
        issuer: 'nepal-adventures',
        audience: 'nepal-adventures-api',
    });

    return { accessToken, refreshToken };
};

// Verify access token
const verifyToken = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'nepal-adventures',
            audience: 'nepal-adventures-api',
        });

        // Check token expiration
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
            });
        }

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            tokenIat: decoded.iat,
        };

        // Check if user still exists in database
        const User = require('../models/User');
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists',
            });
        }

        // Check if user changed password after token was issued
        if (user.passwordChangedAt && user.passwordChangedAt > new Date(req.user.tokenIat)) {
            return res.status(401).json({
                success: false,
                message: 'Password recently changed. Please login again.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                expired: true,
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Token verification failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Verify refresh token
const verifyRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required',
            });
        }

        // Check if token is blacklisted
        if (tokenBlacklist.has(refreshToken)) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token has been revoked',
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
            issuer: 'nepal-adventures',
            audience: 'nepal-adventures-api',
        });

        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }

        next();
    };
};

// Extract token from request
const extractToken = (req) => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Check cookies
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    // Check query parameter (for WebSocket connections)
    if (req.query && req.query.token) {
        return req.query.token;
    }

    return null;
};

// Logout functionality
const logout = (token) => {
    tokenBlacklist.add(token);

    // Clean up blacklist periodically (remove expired tokens)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
};

// Security headers middleware
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.nepaladventures.com"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : ['http://localhost:9000', 'http://127.0.0.1:9000'];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
    },
    name: 'sessionId',
};

// Password strength validator
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumber) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password),
    };
};

// Calculate password strength
const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const strengthLevels = ['very weak', 'weak', 'fair', 'good', 'strong', 'very strong'];
    return strengthLevels[Math.min(strength - 1, strengthLevels.length - 1)];
};

// Two-factor authentication support
const generate2FASecret = () => {
    const speakeasy = require('speakeasy');
    return speakeasy.generateSecret({
        name: 'Nepal Adventures',
        length: 32,
    });
};

const verify2FAToken = (secret, token) => {
    const speakeasy = require('speakeasy');
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
    });
};

// API key management for third-party integrations
const generateAPIKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const verifyAPIKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key required',
        });
    }

    // Verify API key in database
    const APIKey = require('../models/APIKey');
    const keyDoc = await APIKey.findOne({ key: apiKey, active: true });

    if (!keyDoc) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API key',
        });
    }

    // Update last used timestamp
    keyDoc.lastUsed = Date.now();
    keyDoc.usageCount++;
    await keyDoc.save();

    req.apiKey = keyDoc;
    next();
};

module.exports = {
    generateTokens,
    verifyToken,
    verifyRefreshToken,
    authorize,
    logout,
    authLimiter,
    apiLimiter,
    securityHeaders,
    corsOptions,
    sessionConfig,
    mongoSanitize,
    validatePassword,
    generate2FASecret,
    verify2FAToken,
    generateAPIKey,
    verifyAPIKey,
};