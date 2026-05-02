const express = require('express');
const cors = require('cors');
const app = express();
const port = 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage
let users = [];
let projects = [];
let tasks = [];
let userIdCounter = 1;

// Helper function to generate JWT-like token (simplified)
function generateToken(username) {
    return `mock-token-${username}-${Date.now()}`;
}

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
    const { username, password, email, role } = req.body;
    
    // Check if user already exists
    if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Create new user
    const newUser = {
        id: userIdCounter++,
        username,
        password, // In real app, this would be hashed
        email,
        role: role || 'MEMBER'
    };
    
    users.push(newUser);
    
    // Generate token
    const token = generateToken(username);
    
    res.json({
        token,
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(username);
    
    res.json({
        token,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    });
});

// Project endpoints
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

app.post('/api/projects', (req, res) => {
    const project = {
        id: projects.length + 1,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    projects.push(project);
    res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects[projectIndex] = { ...projects[projectIndex], ...req.body };
    res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects.splice(projectIndex, 1);
    res.json({ message: 'Project deleted successfully' });
});

// Task endpoints
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const task = {
        id: tasks.length + 1,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    tasks.push(task);
    res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    res.json({ message: 'Task deleted successfully' });
});

app.get('/api/tasks/overdue', (req, res) => {
    const now = new Date();
    const overdue = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED'
    );
    res.json(overdue);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Mock server is running' });
});

app.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- GET /api/projects');
    console.log('- POST /api/projects');
    console.log('- PUT /api/projects/:id');
    console.log('- DELETE /api/projects/:id');
    console.log('- GET /api/tasks');
    console.log('- POST /api/tasks');
    console.log('- PUT /api/tasks/:id');
    console.log('- DELETE /api/tasks/:id');
    console.log('- GET /api/tasks/overdue');
    console.log('- GET /api/health');
});
