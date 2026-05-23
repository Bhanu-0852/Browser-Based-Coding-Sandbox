// src/pages/NotFound/index.jsx
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './index.css';

const NotFound = () => {
    return (
        <div className="notfound-wrapper">
            <h1 className="notfound-title">404</h1>
            <h2 className="notfound-subtitle">Page Not Found</h2>
            <p className="notfound-text">
                The page you are looking for doesn't exist or has been moved to another secure location.
            </p>
            <Link to="/dashboard" className="notfound-btn">
                <Home size={20} />
                Return to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;