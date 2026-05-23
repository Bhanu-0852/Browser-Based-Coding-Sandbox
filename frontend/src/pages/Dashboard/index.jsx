// src/pages/Dashboard/index.jsx
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

    // ✨ LIVE DATA STATE
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // ✨ FETCH LIVE SESSIONS FROM MONGODB
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

    // ✨ KILL A SESSION INSTANTLY
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

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-header-title">Security Dashboard</h1>
                    <p className="dashboard-header-subtitle">Manage your account and active sessions</p>
                </div>
                <div className="dashboard-actions">
                    <ThemeToggle />
                    <button onClick={() => navigate('/')} className="btn-success">
                        <Code size={18} /> Open Sandbox
                    </button>
                    <button onClick={handleLogout} className="btn-danger">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </header>

            <div className="dashboard-card account-status">
                <div className="account-icon-bg">
                    <Shield size={32} color="var(--accent-color)" />
                </div>
                <div>
                    <h3 className="account-title">Account Status</h3>
                    <p className="account-email">Logged in as: <strong>{user?.email}</strong></p>
                </div>
            </div>

            <div className="dashboard-card">
                <h3 style={{ marginBottom: '1rem' }}>Active Sessions</h3>
                <p className="dashboard-header-subtitle" style={{ fontSize: '0.9rem' }}>
                    Monitor and revoke devices currently logged into your account.
                </p>
                
                {/* ✨ Wrapped in a div with overflowX to prevent mobile squishing */}
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table className="session-table" style={{ minWidth: '600px' }}>
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
                                    <tr key={session.tokenId}>
                                        <td className="device-cell">
                                            {device.type === 'mobile' ? 
                                                <Smartphone size={20} color="var(--text-secondary)" /> : 
                                                <Monitor size={20} color="var(--text-secondary)" />
                                            }
                                            {device.text}
                                        </td>
                                        <td>
                                            {session.ipAddress === '::1' || session.ipAddress === '127.0.0.1' 
                                                ? '127.0.0.1 (Local)' 
                                                : session.ipAddress}
                                        </td>
                                        <td>
                                            {isCurrent ? (
                                                <span className="badge badge-active">Current Session</span>
                                            ) : (
                                                <span className="session-inactive-text">Last active {timeAgo(session.loginTime)}</span>
                                            )}
                                        </td>
                                        <td>
                                            {/* ✨ Don't allow revoking the current session from the table to prevent accidents */}
                                            {isCurrent ? (
                                                <span style={{ color: 'var(--text-secondary)' }}>—</span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRevoke(session.tokenId)} 
                                                    className="btn-danger btn-danger-small"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <Trash2 size={14} /> Revoke
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
    );
};

export default Dashboard;