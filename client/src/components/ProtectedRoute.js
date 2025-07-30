// client/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token'); // Check if a token exists

    if (!token) {
        // If no token, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // If token exists, render the child components (the protected content)
    return children;
};

export default ProtectedRoute;
