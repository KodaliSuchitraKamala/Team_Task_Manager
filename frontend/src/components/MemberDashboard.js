import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [userProjects, setUserProjects] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageMarks: 0
  });
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get('/projects'),
          axios.get('/tasks')
        ]);
        
        // Filter projects created by this user
        const projects = projectsRes.data.filter(p => p.createdBy === user?.id);
        // Filter tasks assigned to or created by this user
        const tasks = tasksRes.data.filter(t => t.assignedTo === user?.id || t.createdBy === user?.id);
        
                
        setUserProjects(projects);
        setUserTasks(tasks);
        
        // Calculate statistics
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
        const evaluatedTasks = tasks.filter(t => t.marks !== null);
        const averageMarks = evaluatedTasks.length > 0 
          ? Math.round(evaluatedTasks.reduce((sum, t) => sum + t.marks, 0) / evaluatedTasks.length)
          : 0;
        
        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: tasks.filter(t => t.status !== 'COMPLETED').length,
          averageMarks
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Handle task editing
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditTask(true);
  };

  // Handle task deletion
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  // Confirm task deletion
  const confirmDeleteTask = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.delete(`/tasks/${taskToDelete.id}`);
      
      // Refresh user tasks
      const tasksRes = await axios.get('/tasks');
      const filteredTasks = tasksRes.data.filter(t => t.assignedTo === user?.id || t.createdBy === user?.id);
      setUserTasks(filteredTasks);
      
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Update task
  const handleUpdateTask = async (updatedTaskData) => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.put(`/tasks/${editingTask.id}`, updatedTaskData);
      
      // Refresh user tasks
      const tasksRes = await axios.get('/tasks');
      const filteredTasks = tasksRes.data.filter(t => t.assignedTo === user?.id || t.createdBy === user?.id);
      setUserTasks(filteredTasks);
      
      setShowEditTask(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#27ae60';
      case 'IN_PROGRESS': return '#3498db';
      case 'IN_REVIEW': return '#f39c12';
      case 'TODO': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#e74c3c';
      case 'HIGH': return '#e67e22';
      case 'MEDIUM': return '#f39c12';
      case 'LOW': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getGradeColor = (marks) => {
    if (marks >= 90) return '#27ae60';
    if (marks >= 80) return '#2ecc71';
    if (marks >= 70) return '#f39c12';
    if (marks >= 60) return '#e67e22';
    return '#e74c3c';
  };

  return (
    <div>
      <div className="navbar">
        <h1>Member Dashboard - Team Task Manager</h1>
        <div className="nav-links">
          <span>Welcome, {user?.username}!</span>
          <Link to="/projects">My Projects</Link>
          <Link to="/tasks">My Tasks</Link>
          <a href="#" onClick={logout}>Logout</a>
        </div>
      </div>
      
      <div className="container">
        {/* Personal Statistics */}
        <div className="card">
          <h2>My Performance Overview</h2>
          
          {/* Debug Information */}
          <div style={{ background: '#f8f9fa', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}>
            <h4>Debug Info:</h4>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Total Tasks:</strong> {userTasks.length}</p>
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Task Details:</strong>
              {userTasks.map(task => (
                <div key={task.id} style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                  Task "{task.title}" - createdBy: {task.createdBy}, assignedTo: {task.assignedTo}, canEdit: {task.createdBy === user?.id ? 'YES' : 'NO'}
                </div>
              ))}
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>My Projects</h3>
              <div className="number">{stats.totalProjects}</div>
            </div>
            <div className="stat-card">
              <h3>My Tasks</h3>
              <div className="number">{stats.totalTasks}</div>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <div className="number">{stats.completedTasks}</div>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="number">{stats.pendingTasks}</div>
            </div>
            <div className="stat-card">
              <h3>Average Marks</h3>
              <div className="number">{stats.averageMarks}/100</div>
            </div>
          </div>
        </div>

        {/* My Projects */}
        <div className="card">
          <h2>My Projects</h2>
          {userProjects.length === 0 ? (
            <p>You haven't created any projects yet.</p>
          ) : (
            <div className="grid">
              {userProjects.map(project => (
                <div key={project.id} className="card">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p>Status: <strong style={{ color: getStatusColor(project.status) }}>{project.status}</strong></p>
                  <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <Link to="/projects" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="card">
          <h2>My Tasks</h2>
          {userTasks.length === 0 ? (
            <p>You don't have any tasks assigned yet.</p>
          ) : (
            <div>
              {userTasks.map(task => (
                <div key={task.id} className="card" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>{task.title}</h4>
                      <p>{task.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <span><strong>Status:</strong> 
                          <span style={{ color: getStatusColor(task.status), marginLeft: '0.25rem' }}>
                            {task.status}
                          </span>
                        </span>
                        <span><strong>Priority:</strong> 
                          <span style={{ color: getPriorityColor(task.priority), marginLeft: '0.25rem' }}>
                            {task.priority}
                          </span>
                        </span>
                        {task.dueDate && (
                          <span><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {/* Evaluation Results */}
                      {task.marks !== null && (
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.5rem', 
                          background: '#f8f9fa', 
                          borderRadius: '4px',
                          border: `2px solid ${getGradeColor(task.marks)}`
                        }}>
                          <p><strong>Evaluation Results:</strong></p>
                          <p><strong>Marks:</strong> {task.marks}/100</p>
                          <p><strong>Grade:</strong> 
                            <span style={{ color: getGradeColor(task.marks), marginLeft: '0.25rem' }}>
                              {task.marks >= 90 ? 'EXCELLENT' : 
                               task.marks >= 80 ? 'GOOD' : 
                               task.marks >= 70 ? 'SATISFACTORY' : 
                               task.marks >= 60 ? 'NEEDS IMPROVEMENT' : 'POOR'}
                            </span>
                          </p>
                          {task.evaluatedAt && (
                            <p><strong>Evaluated:</strong> {new Date(task.evaluatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <Link to="/tasks" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        Manage
                      </Link>
                                          </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Chart */}
        {userTasks.length > 0 && (
          <div className="card">
            <h2>My Performance Chart</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Task Status Distribution */}
              <div>
                <h4>Task Status Distribution</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].map(status => {
                    const count = userTasks.filter(t => t.status === status).length;
                    const percentage = userTasks.length > 0 ? Math.round((count / userTasks.length) * 100) : 0;
                    return (
                      <div key={status} style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: getStatusColor(status),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          marginBottom: '0.25rem'
                        }}>
                          {count}
                        </div>
                        <small>{status}</small>
                        <div><small>{percentage}%</small></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Distribution */}
              <div>
                <h4>Task Priority Distribution</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => {
                    const count = userTasks.filter(t => t.priority === priority).length;
                    const percentage = userTasks.length > 0 ? Math.round((count / userTasks.length) * 100) : 0;
                    return (
                      <div key={priority} style={{ textAlign: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%',
                          background: getPriorityColor(priority),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          marginBottom: '0.25rem'
                        }}>
                          {count}
                        </div>
                        <small>{priority}</small>
                        <div><small>{percentage}%</small></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Progress */}
              <div>
                <h4>Performance Progress</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <small>Completion Rate: {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</small>
                    <div style={{ background: '#ecf0f1', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          background: '#27ae60',
                          height: '100%', 
                          width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                  
                  {stats.averageMarks > 0 && (
                    <div>
                      <small>Average Performance: {stats.averageMarks}/100</small>
                      <div style={{ background: '#ecf0f1', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            background: getGradeColor(stats.averageMarks),
                            height: '100%', 
                            width: `${stats.averageMarks}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Task Edit Modal */}
        {showEditTask && editingTask && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ padding: '2rem', minWidth: '500px' }}>
              <h3>Edit Task</h3>
              <TaskEditForm 
                task={editingTask}
                onClose={() => {
                  setShowEditTask(false);
                  setEditingTask(null);
                }}
                onUpdate={handleUpdateTask}
              />
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && taskToDelete && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ padding: '2rem', minWidth: '400px' }}>
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete the task "{taskToDelete.title}"?</p>
              <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-danger" 
                  onClick={confirmDeleteTask}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Delete
                </button>
                <button 
                  className="btn" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTaskToDelete(null);
                  }}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Task Edit Form Component
const TaskEditForm = ({ task, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'TODO',
    priority: task.priority || 'MEDIUM',
    dueDate: task.dueDate || ''
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
      await onUpdate(formData);
    } catch (error) {
      console.error('Error updating task:', error);
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
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      
      <div className="form-group">
        <label>Status</label>
        <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Priority</label>
        <select name="priority" value={formData.priority} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
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
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn" style={{ backgroundColor: '#27ae60' }}>
          Update Task
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MemberDashboard;
