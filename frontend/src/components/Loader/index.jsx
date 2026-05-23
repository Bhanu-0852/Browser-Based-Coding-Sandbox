// src/components/Loader/index.jsx
import './index.css';

const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="loader-overlay">
            <div className="loader-card">
                <div className="spinner"></div>
                <p className="loader-text">{message}</p>
            </div>
        </div>
    );
};

export default Loader;