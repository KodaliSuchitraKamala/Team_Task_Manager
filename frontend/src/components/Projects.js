import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (editingProject) {
        // Update existing project
        await axios.put(`/projects/${editingProject.id}`, formData);
        setEditingProject(null);
      } else {
        // Create new project
        await axios.post('/projects', formData, { params: { createdBy: user?.id } });
      }
      
      setShowForm(false);
      setFormData({ name: '', description: '', status: 'ACTIVE' });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        await axios.delete(`/projects/${projectId}`);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
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
          <h2>Projects</h2>
          <button className="btn" onClick={() => setShowForm(true)}>New Project</button>
        </div>
        
        {showForm && (
          <div className="card">
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
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
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn">
                  {editingProject ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingProject(null);
                    setFormData({ name: '', description: '', status: 'ACTIVE' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="grid">
          {projects.map(project => (
            <div key={project.id} className="card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p>Status: <strong>{project.status}</strong></p>
              <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn" 
                  onClick={() => handleEdit(project)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(project.id)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
