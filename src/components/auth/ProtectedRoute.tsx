import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  // If no user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, redirect to home
  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};


