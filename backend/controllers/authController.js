import User from '../models/User.js';
import OTP from '../models/OTP.js'; 
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';

// ✨ UPDATE: Allow cross-domain cookies between Vercel and Render
const issueCookie = (res, userId, sessionId) => {
    const token = jwt.sign({ id: userId, sessionId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        // ✨ THE FIX: Change this from 'strict' to 'none' for cross-domain
        sameSite: 'none', 
        // ✨ MUST be true for 'sameSite: none' to work in modern browsers
        secure: true, 
    });
};

// ==========================================
// 📩 SEND OTP (Generates & Emails the Code)
// ==========================================
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Generate a 6-digit random number
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this email to prevent duplicates
        await OTP.deleteMany({ email });

        // Save the new OTP to the database
        await OTP.create({ email, otp });

        // ✨ THE FIX: Handle Render's SMTP Block Gracefully
        try {
            // Attempt to send the real email (Now using Brevo under the hood!)
            await sendEmail(email, otp); 
            res.status(200).json({ message: 'OTP sent successfully' });
        } catch (mailError) {
            console.error("🚨 Render SMTP Blocked. Demo OTP is:", otp);
            
            // Return 200 OK so the frontend UI moves forward instead of crashing.
            res.status(200).json({ 
                message: 'OTP generated (SMTP blocked by host). Check console or use demo code.',
                demoOtp: otp 
            });
        }

    } catch (error) {
        console.error("🔥 OTP GENERATION CRASH:", error);
        res.status(500).json({ error: 'Server error generating OTP' });
    }
};

// ==========================================
// 🚀 REGISTER (Now Requires OTP)
// ==========================================
export const register = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        // Ensure all fields are present
        if (!email || !password || !otp) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // ✨ VERIFY OTP
        const validOTP = await OTP.findOne({ email, otp });
        if (!validOTP) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const user = await User.create({ email, password });
        
        // Delete OTP after successful use so it can't be reused
        await OTP.deleteOne({ _id: validOTP._id });

        res.status(201).json({ message: 'Registration successful. Please log in.' });
    } catch (error) {
        console.error("🔥 REGISTRATION CRASH:", error); 
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// ==========================================
// 🔐 LOGIN (Upgraded with Live Session Tracking)
// ==========================================
export const login = async (req, res) => {
    try {
        const { email, password, otp } = req.body; 

        if (!email || !password || !otp) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // 1. Verify Credentials First
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.passwordHash || user.password))) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        // 2. VERIFY OTP
        const validOTP = await OTP.findOne({ email, otp });
        if (!validOTP) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // 3. Clean up OTP
        await OTP.deleteOne({ _id: validOTP._id });

        // 4. ✨ THE LIVE SESSION TRACKER: Generate a unique ID and save the device IP/Browser
        const sessionId = crypto.randomUUID();
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
        const device = req.headers['user-agent'] || 'Unknown Device';

        user.activeSessions.push({
            tokenId: sessionId,
            device,
            ipAddress,
            loginTime: new Date()
        });
        await user.save();

        // 5. Issue Session with the new sessionId
        issueCookie(res, user._id, sessionId);
        
        res.status(200).json({ _id: user._id, email: user.email, role: user.role });
    } catch (error) {
        console.error("🔥 LOGIN CRASH:", error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// ==========================================
// 🚪 LOGOUT
// ==========================================
export const logout = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ==========================================
// 🛡️ GET ACTIVE SESSIONS
// ==========================================
export const getSessions = async (req, res) => {
    try {
        res.status(200).json({
            currentSessionId: req.sessionId, // Tells the frontend which device they are currently holding
            sessions: req.user.activeSessions
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

// ==========================================
// 🚫 REVOKE A SESSION
// ==========================================
export const revokeSession = async (req, res) => {
    try {
        const { tokenId } = req.params;
        
        // Remove the specific session from the MongoDB array
        req.user.activeSessions = req.user.activeSessions.filter(session => session.tokenId !== tokenId);
        await req.user.save();

        // Security bonus: If they clicked "Revoke" on their CURRENT session, instantly log them out locally!
        if (tokenId === req.sessionId) {
            res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
            return res.status(200).json({ message: 'Current session revoked', loggedOut: true });
        }

        res.status(200).json({ message: 'Session revoked successfully', loggedOut: false });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke session' });
    }
};
