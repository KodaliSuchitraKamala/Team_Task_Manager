import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const [projectsRes, tasksRes, overdueRes] = await Promise.all([
          axios.get('/projects'),
          axios.get('/tasks'),
          axios.get('/tasks/overdue')
        ]);
        
        setStats({
          totalProjects: projectsRes.data.length,
          totalTasks: tasksRes.data.length,
          completedTasks: tasksRes.data.filter(t => t.status === 'COMPLETED').length,
          overdueTasks: overdueRes.data.length
        });
        
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="navbar">
        <h1>Team Task Manager</h1>
        <div className="nav-links">
          <span>Welcome, {user?.username}!</span>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
          <a href="#" onClick={logout}>Logout</a>
        </div>
      </div>
      
      <div className="container">
        <h2>Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <div className="number">{stats.totalProjects}</div>
          </div>
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <div className="number">{stats.totalTasks}</div>
          </div>
          <div className="stat-card">
            <h3>Completed Tasks</h3>
            <div className="number">{stats.completedTasks}</div>
          </div>
          <div className="stat-card">
            <h3>Overdue Tasks</h3>
            <div className="number">{stats.overdueTasks}</div>
          </div>
        </div>
        
        <div className="card">
          <h3>Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <p>No tasks found</p>
          ) : (
            <div>
              {recentTasks.map(task => (
                <div key={task.id} className="card" style={{ marginLeft: '1rem' }}>
                  <h4>{task.title}</h4>
                  <p>Status: {task.status}</p>
                  <p>Priority: {task.priority}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
