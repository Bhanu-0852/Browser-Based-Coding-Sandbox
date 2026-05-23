import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✨ Renamed to 'protect' to match your authRoutes.js file
export const protect = async (req, res, next) => {
    try {
        // 1. Extract the token from the HttpOnly cookie
        const token = req.cookies.jwt;

        // 2. If there's no token, they aren't logged in
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // 3. Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find the user in the database, but DO NOT return the password hash
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        // 5. Attach the user object to the request
        req.user = user;
        
        // ✨ THE LIVE SESSION FIX: Attach the specific session ID to the request!
        // This tells the backend exactly which device made the request.
        req.sessionId = decoded.sessionId; 
        
        // 6. Move to the next middleware or controller function
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};