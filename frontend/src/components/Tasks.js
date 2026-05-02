import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [evaluationCriteria, setEvaluationCriteria] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    assignedToId: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get('/tasks'),
        axios.get('/projects')
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.delete(`/tasks/${taskId}`);
      
      // Refresh tasks list
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (editingTask) {
        // Update existing task
        await axios.put(`/tasks/${editingTask.id}`, formData);
        setEditingTask(null);
      } else {
        // Create new task
        await axios.post('/tasks', {
          ...formData,
          createdBy: user?.id,
          assignedTo: formData.assignedToId || user?.id
        });
      }
      
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: '',
        assignedToId: '',
        dueDate: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.project?.id || '',
      assignedToId: task.assignedTo?.id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        await axios.delete(`/tasks/${taskId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div>
      <div className="navbar">
        <h1>Team Task Manager</h1>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks</Link>
        </div>
      </div>
      
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tasks</h2>
          <button className="btn" onClick={() => setShowForm(true)}>New Task</button>
        </div>
        
        {showForm && (
          <div className="card">
            <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
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
                <button type="submit" className="btn">
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      status: 'TODO',
                      priority: 'MEDIUM',
                      projectId: '',
                      assignedToId: '',
                      dueDate: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="grid">
          {tasks.map(task => (
            <div key={task.id} className="card">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Project: <strong>{task.project?.name}</strong></p>
              <p>Status: <strong>{task.status}</strong></p>
              <p>Priority: <strong>{task.priority}</strong></p>
              {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
              <div style={{ marginTop: '1rem' }}>
                <select 
                  value={task.status} 
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  style={{ marginRight: '0.5rem', padding: '0.25rem' }}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              
              {/* Edit/Delete buttons for tasks created by this user */}
              {task.createdBy === user?.id && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      setEditingTask(task);
                      setFormData({
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        projectId: task.projectId || '',
                        assignedToId: task.assignedTo || '',
                        dueDate: task.dueDate || ''
                      });
                      setShowForm(true);
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#3498db' }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                        handleDeleteTask(task.id);
                      }
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Delete
                  </button>
                </div>
              )}
              
              {/* Show task creator info */}
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7f8c8d' }}>
                {task.createdBy === user?.id ? (
                  <span>📝 Created by you</span>
                ) : (
                  <span>📋 Assigned to you</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
