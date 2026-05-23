// src/pages/Auth/VerifyMFA/index.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import ErrorBanner from '../../../components/ErrorBanner';
import './index.css';

const VerifyMFA = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errorMsg, setErrorMsg] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Auto-focus previous input on backspace
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        const code = otp.join('');
        
        if (code.length < 6) {
            setErrorMsg('Please enter the full 6-digit code');
            setIsVerifying(false);
            return;
        }

        // Mocking the backend OTP verification delay
        setTimeout(() => {
            // Once verified, send them to the Dashboard!
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-panel mfa-panel">
                
                <div className="mfa-icon-wrapper">
                    <div className="mfa-icon-bg">
                        <ShieldCheck size={32} color="var(--success-color)" />
                    </div>
                </div>
                
                <h2 className="mfa-title">Two-Factor Authentication</h2>
                
                <p className="mfa-subtitle">
                    Enter the 6-digit code from your authenticator app to continue.
                </p>

                <ErrorBanner message={errorMsg} />

                <form onSubmit={handleSubmit}>
                    <div className="otp-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                className="otp-input"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)}
                            />
                        ))}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary mfa-submit-btn" 
                        disabled={isVerifying}
                    >
                        {isVerifying ? 'Verifying...' : 'Authenticate'}
                    </button>
                </form>
                
            </div>
        </div>
    );
};

export default VerifyMFA;