import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Projects from './Projects';

const ProtectedProjects = () => {
  const { user } = useAuth();
  
  // Admin users should not access Projects page - redirect to dashboard
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Only members can access Projects page
  return <Projects />;
};

export default ProtectedProjects;
