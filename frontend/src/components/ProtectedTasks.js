import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Tasks from './Tasks';

const ProtectedTasks = () => {
  const { user } = useAuth();
  
  // Admin users should not access Tasks page - redirect to dashboard
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Only members can access Tasks page
  return <Tasks />;
};

export default ProtectedTasks;
