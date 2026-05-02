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
    overdueTasks: 0,
    totalUsers: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [showUserTasks, setShowUserTasks] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [evaluationCriteria, setEvaluationCriteria] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const [projectsRes, tasksRes, overdueRes, usersRes, criteriaRes] = await Promise.all([
          axios.get('/projects'),
          axios.get('/tasks'),
          axios.get('/tasks/overdue'),
          axios.get('/users'),
          axios.get('/evaluation/criteria')
        ]);
        
        const allTasks = tasksRes.data;
        const allUsers = usersRes.data;
        
        setStats({
          totalProjects: projectsRes.data.length,
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.status === 'COMPLETED').length,
          overdueTasks: overdueRes.data.length,
          totalUsers: allUsers.length
        });
        
        setRecentTasks(allTasks.slice(0, 5));
        setUsers(allUsers);
        setEvaluationCriteria(criteriaRes.data);
        
        // Calculate user statistics for admin - show all registered members
        if (user?.role === 'ADMIN') {
          const stats = allUsers.map(u => {
            const userProjects = projectsRes.data.filter(p => p.createdBy === u.id);
            const userTasks = allTasks.filter(t => t.createdBy === u.id || t.assignedTo === u.id);
            const completedUserTasks = userTasks.filter(t => t.status === 'COMPLETED');
            const evaluatedTasks = userTasks.filter(t => t.marks !== null);
            const averageMarks = evaluatedTasks.length > 0 
              ? Math.round(evaluatedTasks.reduce((sum, t) => sum + t.marks, 0) / evaluatedTasks.length)
              : 0;
            
            return {
              user: u,
              projectCount: userProjects.length,
              taskCount: userTasks.length,
              completedTaskCount: completedUserTasks.length,
              evaluatedTaskCount: evaluatedTasks.length,
              averageMarks,
              completionRate: userTasks.length > 0 ? Math.round((completedUserTasks.length / userTasks.length) * 100) : 0
            };
          });
          setUserStats(stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

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
          {user?.role === 'ADMIN' && (
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="number">{stats.totalUsers}</div>
            </div>
          )}
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
        
        {/* Admin-specific user statistics */}
        {user?.role === 'ADMIN' && userStats.length > 0 && (
          <div className="card">
            <h3>User Performance Overview</h3>
            <div className="user-stats-grid">
              {userStats.map((stat, index) => (
                <div key={index} className="user-stat-card">
                  <h4>{stat.user.username} ({stat.user.role})</h4>
                  <div className="user-stats">
                    <p><strong>Projects:</strong> {stat.projectCount}</p>
                    <p><strong>Tasks:</strong> {stat.taskCount}</p>
                    <p><strong>Completed:</strong> {stat.completedTaskCount}</p>
                    <p><strong>Evaluated:</strong> {stat.evaluatedTaskCount}</p>
                    <p><strong>Average Marks:</strong> {stat.averageMarks}/100</p>
                    <p><strong>Completion Rate:</strong> {stat.completionRate}%</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      className="btn" 
                      onClick={() => {
                        setSelectedUser(stat.user);
                        setShowUserTasks(true);
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Create Task
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => {
                        setSelectedUser(stat.user);
                        setUserTasks(recentTasks.filter(t => t.assignedTo === stat.user.id));
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Evaluate Tasks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* User task creation modal */}
        {showUserTasks && selectedUser && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ padding: '2rem', minWidth: '500px' }}>
              <h3>Create Task for {selectedUser.username}</h3>
              <TaskCreationForm 
                assignedUser={selectedUser}
                onClose={() => {
                  setShowUserTasks(false);
                  setSelectedUser(null);
                }}
                onSuccess={() => {
                  setShowUserTasks(false);
                  setSelectedUser(null);
                  // Refresh dashboard data
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}
        
        {/* Task evaluation modal */}
        {showEvaluation && selectedTask && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ padding: '2rem', minWidth: '500px' }}>
              <h3>Evaluate Task: {selectedTask.title}</h3>
              <TaskEvaluationForm 
                task={selectedTask}
                evaluationCriteria={evaluationCriteria}
                onClose={() => {
                  setShowEvaluation(false);
                  setSelectedTask(null);
                }}
                onSuccess={() => {
                  setShowEvaluation(false);
                  setSelectedTask(null);
                  // Refresh dashboard data
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Task creation component for admin
const TaskCreationForm = ({ assignedUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    dueDate: ''
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/projects');
        setProjects(res.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.post('/tasks', {
        ...formData,
        assignedToId: assignedUser.id
      }, { 
        params: { 
          projectId: formData.projectId,
          createdBy: 1 // Admin user ID
        } 
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Task Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>
      <div className="form-group">
        <label>Project</label>
        <select name="projectId" value={formData.projectId} onChange={handleChange} required>
          <option value="">Select Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Priority</label>
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      <div className="form-group">
        <label>Due Date</label>
        <input
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn">Create Task</button>
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Task evaluation component for admin
const TaskEvaluationForm = ({ task, evaluationCriteria, onClose, onSuccess }) => {
  const [marks, setMarks] = useState(task.marks || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.put(`/tasks/${task.id}/evaluate`, { marks: parseInt(marks) });
      
      onSuccess();
    } catch (error) {
      console.error('Error evaluating task:', error);
      alert('Failed to evaluate task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeColor = (marks) => {
    if (marks >= 90) return '#27ae60';
    if (marks >= 80) return '#2ecc71';
    if (marks >= 70) return '#f39c12';
    if (marks >= 60) return '#e67e22';
    return '#e74c3c';
  };

  const getGrade = (marks) => {
    if (marks >= 90) return 'EXCELLENT';
    if (marks >= 80) return 'GOOD';
    if (marks >= 70) return 'SATISFACTORY';
    if (marks >= 60) return 'NEEDS IMPROVEMENT';
    return 'POOR';
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Task Details</label>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <p><strong>Title:</strong> {task.title}</p>
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Assigned To:</strong> {task.assignedTo || 'Unassigned'}</p>
          <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
        </div>
      </div>
      
      <div className="form-group">
        <label>Evaluation Marks (0-100)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      
      {marks && (
        <div className="form-group">
          <label>Evaluation Result Preview</label>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            border: `2px solid ${getGradeColor(parseInt(marks))}`
          }}>
            <p><strong>Marks:</strong> {marks}/100</p>
            <p><strong>Grade:</strong> 
              <span style={{ 
                color: getGradeColor(parseInt(marks)),
                fontWeight: 'bold',
                marginLeft: '0.5rem'
              }}>
                {getGrade(parseInt(marks))}
              </span>
            </p>
            <p><strong>Status:</strong> 
              <span style={{ 
                color: getGradeColor(parseInt(marks)),
                fontWeight: 'bold',
                marginLeft: '0.5rem'
              }}>
                {parseInt(marks) >= 70 ? 'COMPLETED' : parseInt(marks) >= 60 ? 'IN_REVIEW' : 'OVERDUE'}
              </span>
            </p>
          </div>
        </div>
      )}
      
      <div className="form-group">
        <label>Evaluation Criteria</label>
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
          {Object.entries(evaluationCriteria).map(([grade, criteria]) => (
            <div key={grade} style={{ marginBottom: '0.5rem' }}>
              <strong>{grade}:</strong> {criteria.min}-{criteria.max} marks → {criteria.status}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          type="submit" 
          className="btn" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: isSubmitting ? '#95a5a6' : '#27ae60',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Evaluating...' : 'Submit Evaluation'}
        </button>
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default Dashboard;
