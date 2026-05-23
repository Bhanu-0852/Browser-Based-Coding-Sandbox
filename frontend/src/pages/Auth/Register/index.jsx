// src/pages/Auth/Register/index.jsx
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, MailCheck, RefreshCw } from 'lucide-react';
import ErrorBanner from '../../../components/ErrorBanner';
import PasswordStrength from '../../../components/PasswordStrength'; 
import Loader from '../../../components/Loader';
import api from '../../../services/api'; // ✨ Imported the API service to make real backend calls
import './index.css';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);           
    const [otp, setOtp] = useState('');                      
    const [successMsg, setSuccessMsg] = useState('');        
    
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (otpSent && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    // ✨ REAL BACKEND CALL: Resend OTP
    const handleResendOTP = async () => {
        setIsSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            await api.post('/auth/send-otp', { email });
            setTimer(30); 
            setCanResend(false); 
            setSuccessMsg('A new OTP has been sent to your email.');
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✨ REAL BACKEND CALL: Send Initial OTP
        if (!otpSent) {
            setIsSubmitting(true);
            setErrorMsg('');
            setSuccessMsg('');
            
            try {
                // Hitting the backend to generate and email the code
                await api.post('/auth/send-otp', { email });
                setOtpSent(true);
                setSuccessMsg('OTP sent! Please check your email.');
            } catch (error) {
                // Catches backend errors like "Email is already registered"
                setErrorMsg(error.response?.data?.message || 'Failed to send OTP. Please check your email and try again.');
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // STEP 2: Verify the 6-digit OTP and send to AuthContext
        if (otp.length < 6) {
            setErrorMsg('Please enter the full 6-digit OTP.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        const result = await register(email, password, otp); 
        
        if (result.success) {
            navigate('/login'); 
        } else {
            setErrorMsg(result.error || 'Registration failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isSubmitting && <Loader message={otpSent && otp.length === 6 ? "Creating account..." : "Processing..."} />}

            <div className="auth-wrapper">
                <div className="auth-panel">
                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p className="auth-subtitle">Join the secure coding platform</p>
                    </div>

                    <ErrorBanner message={errorMsg} />
                    
                    {successMsg && (
                        <div className="success-banner">
                            <MailCheck size={18} /> {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <input 
                            type="email" 
                            className="auth-input" 
                            placeholder="Email address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={otpSent} 
                            required 
                        />
                        
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="auth-input auth-input-password" 
                                placeholder="Password (min 6 chars)" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={otpSent} 
                                required 
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {!otpSent && <PasswordStrength password={password} />}

                        {otpSent && (
                            <div className="otp-section">
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    autoFocus
                                    style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
                                />
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {!otpSent ? 'Send OTP' : 'Verify & Create Account'}
                        </button>
                    </form>

                    {otpSent && (
                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
                            {canResend ? (
                                <button 
                                    onClick={handleResendOTP} 
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', width: '100%', fontWeight: '600' }}
                                >
                                    <RefreshCw size={14} /> Resend OTP
                                </button>
                            ) : (
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    Resend code in <strong>{timer}s</strong>
                                </span>
                            )}
                        </div>
                    )}

                    <div className="auth-footer">
                        <p>
                            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;