import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import MemberDashboard from './MemberDashboard';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  // Route to different dashboards based on user role
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else {
    return <MemberDashboard />;
  }
};

export default RoleBasedDashboard;
