import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [showTaskEvaluation, setShowTaskEvaluation] = useState(false);
  const [showProjectEvaluation, setShowProjectEvaluation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [evaluationCriteria, setEvaluationCriteria] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const [usersRes, tasksRes, projectsRes, criteriaRes] = await Promise.all([
          axios.get('/users'),
          axios.get('/tasks'),
          axios.get('/projects'),
          axios.get('/evaluation/criteria')
        ]);
        
        setUsers(usersRes.data);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
        setEvaluationCriteria(criteriaRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate user statistics
  const getUserStats = () => {
    return users.map(u => {
      const userTasks = tasks.filter(t => t.assignedTo === u.id || t.createdBy === u.id);
      const userProjects = projects.filter(p => p.createdBy === u.id);
      const completedTasks = userTasks.filter(t => t.status === 'COMPLETED');
      const evaluatedTasks = userTasks.filter(t => t.marks !== null);
      const averageMarks = evaluatedTasks.length > 0 
        ? Math.round(evaluatedTasks.reduce((sum, t) => sum + t.marks, 0) / evaluatedTasks.length)
        : 0;
      
      return {
        user: u,
        taskCount: userTasks.length,
        projectCount: userProjects.length,
        completedTaskCount: completedTasks.length,
        evaluatedTaskCount: evaluatedTasks.length,
        averageMarks
      };
    });
  };

  // Calculate project statistics for graphical representation
  const getProjectStats = () => {
    return projects.map(p => {
      const projectTasks = tasks.filter(t => t.projectId === p.id);
      const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED');
      const evaluatedTasks = projectTasks.filter(t => t.marks !== null);
      const averageMarks = evaluatedTasks.length > 0 
        ? Math.round(evaluatedTasks.reduce((sum, t) => sum + t.marks, 0) / evaluatedTasks.length)
        : 0;
      
      return {
        project: p,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        evaluatedTasks: evaluatedTasks.length,
        averageMarks,
        completionRate: projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0
      };
    });
  };

  const userStats = getUserStats();
  const projectStats = getProjectStats();

  return (
    <div>
      <div className="navbar">
        <h1>Admin Dashboard - Team Task Manager</h1>
        <div className="nav-links">
          <span>Welcome, Admin {user?.username}!</span>
          <a href="#" onClick={logout}>Logout</a>
        </div>
      </div>
      
      <div className="container">
        {/* Admin Overview Stats */}
        <div className="card">
          <h2>Team Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Members</h3>
              <div className="number">{users.length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <div className="number">{tasks.length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Projects</h3>
              <div className="number">{projects.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completed Tasks</h3>
              <div className="number">{tasks.filter(t => t.status === 'COMPLETED').length}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn" 
              onClick={() => setShowTaskCreation(true)}
              style={{ backgroundColor: '#3498db', padding: '1rem 2rem', fontSize: '1rem' }}
            >
              Create Task for Member
            </button>
            <button 
              className="btn" 
              onClick={() => setShowTaskEvaluation(true)}
              style={{ backgroundColor: '#f39c12', padding: '1rem 2rem', fontSize: '1rem' }}
            >
              Evaluate Tasks
            </button>
            <button 
              className="btn" 
              onClick={() => setShowProjectEvaluation(true)}
              style={{ backgroundColor: '#27ae60', padding: '1rem 2rem', fontSize: '1rem' }}
            >
              Evaluate Projects
            </button>
          </div>
        </div>

        {/* Member Performance Overview */}
        <div className="card">
          <h2>Member Performance Overview</h2>
          <div className="user-stats-grid">
            {userStats.map((stat, index) => (
              <div key={index} className="user-stat-card">
                <h4>{stat.user.username}</h4>
                <div className="user-stats">
                  <p><strong>Tasks:</strong> {stat.taskCount}</p>
                  <p><strong>Projects:</strong> {stat.projectCount}</p>
                  <p><strong>Completed:</strong> {stat.completedTaskCount}</p>
                  <p><strong>Average Marks:</strong> {stat.averageMarks}/100</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      setSelectedUser(stat.user);
                      setShowTaskCreation(true);
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Create Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Progress Graphical Representation */}
        <div className="card">
          <h2>Member Progress - Graphical Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {userStats.map((stat, index) => (
              <div key={index} style={{ border: '2px solid #3498db', padding: '1.5rem', borderRadius: '8px', background: '#f8f9fa' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>{stat.user.username}'s Performance</h3>
                
                {/* Performance Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{stat.taskCount}</div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Total Tasks</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>{stat.completedTaskCount}</div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Completed</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>{stat.evaluatedTaskCount}</div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Evaluated</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.averageMarks >= 80 ? '#27ae60' : stat.averageMarks >= 60 ? '#f39c12' : '#e74c3c' }}>
                      {stat.averageMarks}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Avg Marks</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span><strong>Task Completion Rate:</strong></span>
                      <span>{stat.taskCount > 0 ? Math.round((stat.completedTaskCount / stat.taskCount) * 100) : 0}%</span>
                    </div>
                    <div style={{ background: '#ecf0f1', height: '25px', borderRadius: '12px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          background: 'linear-gradient(90deg, #3498db, #2980b9)',
                          height: '100%', 
                          width: `${stat.taskCount > 0 ? (stat.completedTaskCount / stat.taskCount) * 100 : 0}%`,
                          transition: 'width 0.5s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {stat.taskCount > 0 ? Math.round((stat.completedTaskCount / stat.taskCount) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span><strong>Performance Score:</strong></span>
                      <span>{stat.averageMarks}/100</span>
                    </div>
                    <div style={{ background: '#ecf0f1', height: '25px', borderRadius: '12px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          background: stat.averageMarks >= 80 ? 'linear-gradient(90deg, #27ae60, #229954)' : 
                                   stat.averageMarks >= 60 ? 'linear-gradient(90deg, #f39c12, #e67e22)' : 
                                   'linear-gradient(90deg, #e74c3c, #c0392b)',
                          height: '100%', 
                          width: `${stat.averageMarks}%`,
                          transition: 'width 0.5s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {stat.averageMarks}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      setSelectedUser(stat.user);
                      setShowTaskCreation(true);
                    }}
                    style={{ backgroundColor: '#3498db', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Create Task
                  </button>
                  <button 
                    className="btn" 
                    onClick={() => {
                      const userTasks = tasks.filter(t => t.assignedTo === stat.user.id || t.createdBy === stat.user.id);
                      setSelectedUser(stat.user);
                      setUserTasks(userTasks);
                      setShowTaskEvaluation(true);
                    }}
                    style={{ backgroundColor: '#f39c12', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Evaluate Tasks
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Creation Modal */}
        {showTaskCreation && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ padding: '2rem', minWidth: '600px' }}>
              <h3>Create Task for Member</h3>
              <TaskCreationForm 
                users={users}
                projects={projects}
                selectedUser={selectedUser}
                onClose={() => {
                  setShowTaskCreation(false);
                  setSelectedUser(null);
                }}
                onSuccess={() => {
                  setShowTaskCreation(false);
                  setSelectedUser(null);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}

        {/* Task Evaluation Modal */}
        {showTaskEvaluation && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ padding: '2rem', minWidth: '800px', maxHeight: '80vh', overflow: 'auto' }}>
              <h3>Evaluate Tasks</h3>
              <TaskEvaluationList 
                tasks={tasks}
                users={users}
                evaluationCriteria={evaluationCriteria}
                onClose={() => setShowTaskEvaluation(false)}
                onSuccess={() => {
                  setShowTaskEvaluation(false);
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

// Task Creation Form Component
const TaskCreationForm = ({ users, projects, selectedUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: '',
    assignedToId: selectedUser?.id || '',
    dueDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.post('/tasks', {
        ...formData,
        status: 'TODO'
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
        <label>Assign to Member</label>
        <select name="assignedToId" value={formData.assignedToId} onChange={handleChange} required>
          <option value="">Select Member</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>
      
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

// Task Evaluation List Component
const TaskEvaluationList = ({ tasks, users, evaluationCriteria, onClose, onSuccess }) => {
  const [evaluatingTask, setEvaluatingTask] = useState(null);
  const [marks, setMarks] = useState('');

  const handleEvaluate = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.put(`/tasks/${taskId}/evaluate`, { marks: parseInt(marks) });
      
      setEvaluatingTask(null);
      setMarks('');
      onSuccess();
    } catch (error) {
      console.error('Error evaluating task:', error);
      alert('Failed to evaluate task. Please try again.');
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

  const unEvaluatedTasks = tasks.filter(t => t.marks === null);

  return (
    <div>
      <p><strong>Tasks to Evaluate: {unEvaluatedTasks.length}</strong></p>
      
      {unEvaluatedTasks.length === 0 ? (
        <p>All tasks have been evaluated!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {unEvaluatedTasks.map(task => (
            <div key={task.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
              <h4>{task.title}</h4>
              <p><strong>Assigned to:</strong> {users.find(u => u.id === task.assignedTo)?.username || 'Unassigned'}</p>
              <p><strong>Project:</strong> {task.projectId}</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              
              {evaluatingTask === task.id ? (
                <div style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Evaluation Marks (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  
                  {marks && (
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '0.5rem', 
                      borderRadius: '4px',
                      border: `2px solid ${getGradeColor(parseInt(marks))}`,
                      marginBottom: '1rem'
                    }}>
                      <small><strong>Grade:</strong> {getGrade(parseInt(marks))} ({getGradeColor(parseInt(marks)) === '#27ae60' ? 'COMPLETED' : getGradeColor(parseInt(marks)) === '#f39c12' ? 'IN_REVIEW' : 'OVERDUE'})</small>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn" 
                      onClick={() => handleEvaluate(task.id)}
                      style={{ backgroundColor: '#27ae60' }}
                    >
                      Submit Evaluation
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => {
                        setEvaluatingTask(null);
                        setMarks('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn" 
                  onClick={() => setEvaluatingTask(task.id)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Evaluate Task
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
