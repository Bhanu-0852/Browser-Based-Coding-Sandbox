import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Monitor, Smartphone, LogOut, Code, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import api from '../../services/api';
import Loader from '../../components/Loader';
import './index.css';

// 🛠️ HELPER: Converts raw User-Agent into clean text and icon type
const parseDevice = (userAgent) => {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let type = 'desktop';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) { os = 'Android'; type = 'mobile'; }
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS'; type = 'mobile'; }

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    return { text: `${os} - ${browser}`, type };
};

// 🛠️ HELPER: Calculates "2h ago" dynamically
const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get('/auth/sessions');
                setSessions(res.data.sessions);
                setCurrentSessionId(res.data.currentSessionId);
            } catch (error) {
                console.error("Failed to load sessions", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const handleRevoke = async (tokenId) => {
        try {
            const res = await api.delete(`/auth/sessions/${tokenId}`);
            if (res.data.loggedOut) {
                await logout();
                navigate('/login');
            } else {
                setSessions(sessions.filter(s => s.tokenId !== tokenId));
            }
        } catch (error) {
            console.error("Failed to revoke session", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (isLoading) return <Loader message="Loading security details..." />;

    // Extract first letter for the Avatar
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <div className="premium-dashboard-wrapper">
            <div className="dashboard-container">
                
                {/* Header Section */}
                <header className="premium-header">
                    <div className="header-text">
                        <h1 className="header-title">Security Dashboard</h1>
                        <p className="header-subtitle">Manage your account and active sessions securely.</p>
                    </div>
                    <div className="header-actions">
                        <ThemeToggle />
                        <button onClick={() => navigate('/')} className="btn-premium-primary">
                            <Code size={18} /> Open Sandbox
                        </button>
                        <button onClick={handleLogout} className="btn-premium-secondary">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </header>

                {/* Account Status Card */}
                <div className="premium-card account-card">
                    <div className="avatar-circle">
                        {userInitial}
                    </div>
                    <div className="account-details">
                        <span className="account-label">ACCOUNT STATUS</span>
                        <h2 className="account-email">{user?.email}</h2>
                    </div>
                    <div className="shield-watermark">
                        <Shield size={120} strokeWidth={1} />
                    </div>
                </div>

                {/* Active Sessions Card */}
                <div className="premium-card sessions-card">
                    <div className="sessions-header">
                        <h3>Active Sessions</h3>
                        <p>Monitor and revoke devices currently logged into your account.</p>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>Location / IP</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(session => {
                                    const device = parseDevice(session.device);
                                    const isCurrent = session.tokenId === currentSessionId;
                                    
                                    return (
                                        <tr key={session.tokenId} className="table-row">
                                            <td className="device-info">
                                                <div className="device-icon">
                                                    {device.type === 'mobile' ? 
                                                        <Smartphone size={18} /> : 
                                                        <Monitor size={18} />
                                                    }
                                                </div>
                                                <span className="device-text">{device.text}</span>
                                            </td>
                                            <td className="ip-info">
                                                {session.ipAddress === '::1' || session.ipAddress === '127.0.0.1' 
                                                    ? '127.0.0.1 (Local)' 
                                                    : session.ipAddress}
                                            </td>
                                            <td>
                                                {isCurrent ? (
                                                    <div className="status-badge active">
                                                        <span className="pulse-dot"></span>
                                                        Current Session
                                                    </div>
                                                ) : (
                                                    <span className="status-text">Last active {timeAgo(session.loginTime)}</span>
                                                )}
                                            </td>
                                            <td>
                                                {isCurrent ? (
                                                    <span className="no-action">—</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleRevoke(session.tokenId)} 
                                                        className="btn-revoke"
                                                    >
                                                        <Trash2 size={16} /> Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
