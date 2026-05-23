// src/components/ProtectedRoute/index.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../Loader'; // 👈 It is imported here

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    // 1. If the AuthContext is still checking the local storage or backend
    //    for a valid session, the Loader is displayed.
    if (loading) {
        return <Loader message="Verifying secure session..." />;
    }
    
    // 2. If no user is found after loading finishes, kick them to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // 3. If authenticated, render the actual page
    return children;
};

export default ProtectedRoute;