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

// 1. Helmet: Secures HTTP headers
app.use(helmet());

// 2. CORS: Use the FRONTEND_URL from your .env (which you updated to your Vercel URL!)
const corsOptions = {
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        process.env.FRONTEND_URL // This now points to your Vercel app
    ].filter(Boolean), // Removes undefined/null entries
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

// 3. Parsers
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

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// ==========================================
// 🚨 GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error("🚨 UNHANDLED SERVER CRASH:", err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Secure server running on port ${PORT}`);
});
