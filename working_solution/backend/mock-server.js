const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8082;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Persistent storage functions
function loadData(filename, defaultValue = []) {
    try {
        if (fs.existsSync(filename)) {
            const data = fs.readFileSync(filename, 'utf8');
            return JSON.parse(data);
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return defaultValue;
    }
}

function saveData(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
    }
}

// Mock data storage with persistence
let users = loadData(USERS_FILE);
let projects = loadData(PROJECTS_FILE);
let tasks = loadData(TASKS_FILE);
let userIdCounter = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

// Evaluation criteria
const EVALUATION_CRITERIA = {
    EXCELLENT: { min: 90, max: 100, status: 'COMPLETED' },
    GOOD: { min: 80, max: 89, status: 'COMPLETED' },
    SATISFACTORY: { min: 70, max: 79, status: 'COMPLETED' },
    NEEDS_IMPROVEMENT: { min: 60, max: 69, status: 'IN_REVIEW' },
    POOR: { min: 0, max: 59, status: 'OVERDUE' }
};

// Helper function to generate JWT-like token (simplified)
function generateToken(user) {
    // Create a mock JWT payload with user info
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiry
    };
    
    // Create a simple token structure (not real JWT, but contains user info)
    // Use Buffer for Node.js compatibility
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = Buffer.from('mock-signature').toString('base64');
    
    return `${header}.${payloadStr}.${signature}`;
}

// Helper function to evaluate task based on marks
function evaluateTask(marks) {
    for (const [grade, criteria] of Object.entries(EVALUATION_CRITERIA)) {
        if (marks >= criteria.min && marks <= criteria.max) {
            return {
                grade,
                status: criteria.status,
                marks
            };
        }
    }
    return {
        grade: 'POOR',
        status: 'OVERDUE',
        marks
    };
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
        password, // In production, hash this password
        email,
        role: role || 'MEMBER',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData(USERS_FILE, users); // Save persistently
    
    // Generate token
    const token = generateToken(newUser);
    
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
    
    const token = generateToken(user);
    
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
    saveData(PROJECTS_FILE, projects); // Save persistently
    res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects[projectIndex] = { ...projects[projectIndex], ...req.body };
    saveData(PROJECTS_FILE, projects); // Save persistently
    res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects.splice(projectIndex, 1);
    saveData(PROJECTS_FILE, projects); // Save persistently
    res.json({ message: 'Project deleted successfully' });
});

// Task endpoints
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const task = {
        id: tasks.length + 1,
        title: req.body.title,
        description: req.body.description || '',
        status: req.body.status || 'TODO',
        priority: req.body.priority || 'MEDIUM',
        projectId: req.body.projectId || null,
        createdBy: req.body.createdBy || null,
        assignedTo: req.body.assignedToId || req.body.assignedTo || null,
        dueDate: req.body.dueDate || null,
        marks: req.body.marks || null,
        grade: req.body.grade || null,
        evaluatedAt: req.body.marks ? new Date().toISOString() : null,
        createdAt: new Date().toISOString()
    };
    tasks.push(task);
    saveData(TASKS_FILE, tasks); // Save persistently
    res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    saveData(TASKS_FILE, tasks); // Save persistently
    res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    saveData(TASKS_FILE, tasks); // Save persistently
    res.json({ message: 'Task deleted successfully' });
});

// Task evaluation endpoint
app.put('/api/tasks/:id/evaluate', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    const { marks } = req.body;
    if (typeof marks !== 'number' || marks < 0 || marks > 100) {
        return res.status(400).json({ message: 'Marks must be a number between 0 and 100' });
    }
    
    const evaluation = evaluateTask(marks);
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...evaluation,
        evaluatedAt: new Date().toISOString()
    };
    
    saveData(TASKS_FILE, tasks); // Save persistently
    res.json(tasks[taskIndex]);
});

// Get evaluation criteria
app.get('/api/evaluation/criteria', (req, res) => {
    res.json(EVALUATION_CRITERIA);
});

app.get('/api/tasks/overdue', (req, res) => {
    const now = new Date();
    const overdue = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED'
    );
    res.json(overdue);
});

// Users endpoint for admin
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Mock server is running' });
});

app.listen(port, '0.0.0.0', '0.0.0.0', () => {
    console.log(`Mock server running at http://10.253.25.179:${port}`);
    console.log(`Mock server also accessible at http://localhost:${port}`);
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
    console.log('- PUT /api/tasks/:id/evaluate');
    console.log('- GET /api/evaluation/criteria');
    console.log('- GET /api/users');
    console.log('- GET /api/health');
});
