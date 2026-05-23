import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// ==========================================
// 🛡️ SECURITY MIDDLEWARE PIPELINE
// ==========================================

// 1. Helmet: Secures HTTP headers and hides Express fingerprint
app.use(helmet());

// 2. CORS: Only allow our Vite frontend to talk to this API, and allow cookies
// ✨ THE FIX: Accept requests from Vite's default ports AND your .env URL
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        process.env.FRONTEND_URL
    ],
    credentials: true, // Crucial for HttpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// 3. Parsers: Read JSON data and cookies
app.use(express.json());
app.use(cookieParser());

// ==========================================
// 🗄️ DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB securely connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==========================================
// 🚦 ROUTES 
// ==========================================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Secure Sandbox API is running' });
});

// 2️⃣ MOUNT YOUR AUTH ROUTES HERE
app.use('/api/auth', authRoutes);

// 3️⃣ MOUNT YOUR PROJECT ROUTES HERE
app.use('/api/projects', projectRoutes);

// ==========================================
// 🚨 GLOBAL ERROR HANDLER
// ==========================================
// This catches any stray crashes and forces them to print in the terminal
app.use((err, req, res, next) => {
    console.error("🚨 UNHANDLED SERVER CRASH:", err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Secure server running on http://localhost:${PORT}`);
});