// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import './App.css'; 

import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Sandbox from './pages/Sandbox';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ color: 'var(--text-primary)', textAlign: 'center', marginTop: '20vh' }}>Loading Secure Session...</div>;

  return (
    <Router>
      <Routes>
        {/* ✨ UX FLOW FIXED:
          Since the Email OTP *is* your MFA now, users are fully authenticated 
          the moment they log in. Send them straight to the Sandbox!
        */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Application Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Sandbox /></ProtectedRoute>} />
        
        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;