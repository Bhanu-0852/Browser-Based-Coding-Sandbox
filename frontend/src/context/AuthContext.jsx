// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('sandbox_user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    const login = async (email, password, otp) => {
        try {
            const res = await api.post('/auth/login', { email, password, otp });
            setUser(res.data);
            localStorage.setItem('sandbox_user', JSON.stringify(res.data));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Invalid Credentials' };
        }
    };

    // ✨ UPDATED: Added 'otp' parameter to match the backend expectations
    const register = async (email, password, otp) => {
        try {
            await api.post('/auth/register', { email, password, otp });
            return { success: true };
        } catch (err) {
            // ✨ This will now capture the "OTP must be exactly 6 digits" error from your backend
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('sandbox_user');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};