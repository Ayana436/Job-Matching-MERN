// Bouncer for routes
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Not logged in? Go to Auth
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    // 2. Logged in, but wrong role? Go to home
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;