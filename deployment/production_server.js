const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8081;

// Data files for persistent storage
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

// Load data from files
function loadData(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
    return [];
}

// Save data to files
function saveData(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving ${filePath}:`, error);
    }
}

// Initialize data
let users = loadData(USERS_FILE) || [{
    id: 1,
    username: "Suchitra Kamala",
    password: "Suchitra1325",
    email: "kodalisuchitra66@gmail.com",
    role: "ADMIN",
    createdAt: new Date().toISOString()
}];

let projects = loadData(PROJECTS_FILE) || [];
let tasks = loadData(TASKS_FILE) || [];

// Middleware
app.use(cors());
app.use(express.json());

// Evaluation criteria
const EVALUATION_CRITERIA = {
    EXCELLENT: { min: 90, max: 100, status: 'COMPLETED' },
    GOOD: { min: 80, max: 89, status: 'COMPLETED' },
    SATISFACTORY: { min: 70, max: 79, status: 'COMPLETED' },
    NEEDS_IMPROVEMENT: { min: 60, max: 69, status: 'IN_REVIEW' },
    POOR: { min: 0, max: 59, status: 'OVERDUE' }
};

// Helper function to generate JWT-like token
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        exp: Date.now() + (24 * 60 * 60 * 1000)
    };
    
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = Buffer.from('mock-signature').toString('base64');
    
    return `${header}.${payloadStr}.${signature}`;
}

// Helper function to evaluate task
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
    return { grade: 'POOR', status: 'OVERDUE', marks };
}

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
    const { username, password, email, role } = req.body;
    
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    
    const newUser = {
        id: users.length + 1,
        username,
        password,
        email,
        role: role || 'MEMBER',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData(USERS_FILE, users);
    
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
    saveData(PROJECTS_FILE, projects);
    res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects[projectIndex] = { ...projects[projectIndex], ...req.body };
    saveData(PROJECTS_FILE, projects);
    res.json(projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    projects.splice(projectIndex, 1);
    saveData(PROJECTS_FILE, projects);
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
    saveData(TASKS_FILE, tasks);
    res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    saveData(TASKS_FILE, tasks);
    res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    
    tasks.splice(taskIndex, 1);
    saveData(TASKS_FILE, tasks);
    res.json({ message: 'Task deleted successfully' });
});

app.put('/api/tasks/:id/evaluate', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { marks } = req.body;
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (typeof marks !== 'number' || marks < 0 || marks > 100) {
        return res.status(400).json({ message: 'Marks must be a number between 0 and 100' });
    }

    const evaluation = evaluateTask(marks);
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...evaluation,
        evaluatedAt: new Date().toISOString()
    };
    
    saveData(TASKS_FILE, tasks);
    res.json(tasks[taskIndex]);
});

// Users endpoint for admin
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Production server is running' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Handle React routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Production server running at http://10.65.65.179:${port}`);
    console.log(`Frontend available at http://10.65.65.179:3000`);
    console.log('Production endpoints available');
});

module.exports = app;
