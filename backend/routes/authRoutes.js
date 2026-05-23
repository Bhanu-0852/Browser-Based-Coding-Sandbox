// backend/routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
// ✨ THE FIX: Imported your new session controllers
import { register, login, logout, sendOTP, getSessions, revokeSession } from '../controllers/authController.js'; 
// ✨ THE FIX: Imported your new security middleware
import { protect } from '../middleware/requireAuth.js';

const router = express.Router();

// 🔍 NEW: Request Logger Middleware
// This will print the exact data coming from React into your terminal!
router.use((req, res, next) => {
    console.log(`🔥 Incoming ${req.method} request to ${req.originalUrl}`);
    
    // ✨ THE FIX: Added 'req.body &&' to prevent crashes on empty requests (like Logout)
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Payload:`, { ...req.body, password: '***' }); // Hides password for security
    }
    next();
});

// 🛡️ SECURITY: Rate Limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true, 
    legacyHeaders: false,
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, 
    message: { error: 'Too many OTP requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 🛡️ EXPRESS-VALIDATOR MIDDLEWARES
const validateEmail = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    }
];

const validateAuthInput = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'), 
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    }
];

// ==========================================
// 🚦 STANDARD API ENDPOINTS
// ==========================================

router.post('/send-otp', otpLimiter, validateEmail, sendOTP); 
router.post('/register', validateAuthInput, register);
router.post('/login', loginLimiter, validateAuthInput, login);
router.post('/logout', logout);

// ==========================================
// ✨ LIVE SESSION ENDPOINTS
// ==========================================

// These routes are protected! You must have a valid JWT cookie to access them.
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:tokenId', protect, revokeSession);

export default router;