// src/components/PasswordStrength/index.jsx
import zxcvbn from 'zxcvbn';
import './index.css';

const PasswordStrength = ({ password }) => {
    if (!password) return null; // Don't show anything if input is empty

    const score = zxcvbn(password).score;
    const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

    return (
        <div className="strength-meter-container">
            <div className="strength-meter-track">
                <div 
                    className="strength-meter-fill"
                    style={{ 
                        width: `${(score + 1) * 20}%`, 
                        backgroundColor: strengthColors[score] 
                    }}
                ></div>
            </div>
            <span className="strength-meter-text">
                Password Strength: <strong>{labels[score]}</strong>
            </span>
        </div>
    );
};

export default PasswordStrength;