# Team Task Manager

A full-stack web application for team project and task management with role-based access control, complete CRUD operations, and modern UI.

## 🚀 Features

- **Authentication System**: User registration and login with JWT tokens
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Complete CRUD operations for tasks with status tracking
- **Dashboard**: Real-time statistics and overview of projects and tasks
- **Task Status Updates**: Quick status changes (To Do, In Progress, In Review, Completed)
- **Priority Management**: Task priority levels (Low, Medium, High, Urgent)
- **Due Date Tracking**: Task deadlines and overdue notifications
- **Responsive Design**: Modern UI that works on all devices
- **Navigation**: Seamless navigation between pages without authentication loss

## 🛠️ Tech Stack

### Backend (Mock Server)
- **Node.js** with Express.js for REST API
- **In-memory storage** for development and testing
- **CORS enabled** for frontend integration
- **JWT-like token** authentication system
- **Full CRUD operations** for projects and tasks

### Frontend
- **React 18** with functional components and hooks
- **React Router** for client-side navigation
- **Axios** for API communication
- **CSS3** for responsive styling
- **Context API** for state management

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** (for both frontend and mock backend)
- **npm** or **yarn** package manager

### Setup Instructions

1. **Clone the repository**:
```bash
git clone https://github.com/KodaliSuchitraKamala/Team_Task_Manager.git
cd Team_Task_Manager
```

2. **Start the Mock Backend Server**:
```bash
# Install backend dependencies
npm install express cors

# Start the mock server
node mock-server.js
```
The backend will start on `http://localhost:8081`

3. **Start the Frontend** (in a new terminal):
```bash
cd frontend

# Install frontend dependencies
npm install

# Start the React app
npm start
```
The frontend will start on `http://localhost:3000`

4. **Access the Application**:
- Open your browser and go to `http://localhost:3000`
- Register a new account or login
- Start managing your projects and tasks!

## 📡 API Endpoints

**Base URL**: `http://localhost:8081/api`

### Authentication
- `POST /auth/login` - User login with JWT token response
- `POST /auth/register` - User registration with role assignment

### Projects (Complete CRUD)
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update existing project
- `DELETE /projects/:id` - Delete project

### Tasks (Complete CRUD)
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task with project assignment
- `PUT /tasks/:id` - Update task (status, priority, etc.)
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/overdue` - Get overdue tasks

### Health Check
- `GET /health` - Server health status

## 🌐 Deployment

### Railway Deployment

1. **Push to GitHub**: Repository is already at `https://github.com/KodaliSuchitraKamala/Team_Task_Manager`

2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will detect the Node.js application

3. **Environment Variables** (if needed):
   - `PORT` - Application port (Railway sets this automatically)
   - `JWT_SECRET` - JWT token secret for authentication

4. **Deploy**: Railway will automatically build and deploy your application

### Alternative Deployment Options

- **Vercel**: Great for React frontend
- **Netlify**: Static site hosting for frontend
- **Heroku**: Full-stack deployment
- **DigitalOcean**: Custom server deployment

## 📁 Project Structure

```
Team_Task_Manager/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components (Dashboard, Projects, Tasks)
│   │   ├── context/         # Authentication context
│   │   └── App.js          # Main application component
│   ├── public/              # Static files
│   └── package.json         # Frontend dependencies
├── mock-server.js           # Node.js Express backend
├── package.json             # Backend dependencies
└── README.md                # This file
```

## 👥 User Roles & Permissions

### Admin Role
- Full access to all features
- Can create, edit, and delete any project
- Can create, edit, and delete any task
- Can view all projects and tasks

### Member Role
- Can create projects and tasks
- Can edit and delete own projects and tasks
- Limited access to assigned projects and tasks

## 🎯 How to Use

### 1. **Registration & Login**
- Visit `http://localhost:3000`
- Click "Register" to create a new account
- Choose your role (Admin or Member)
- Login with your credentials

### 2. **Dashboard Overview**
- View total projects and tasks
- See completed and overdue tasks
- Quick access to recent tasks

### 3. **Project Management**
- Click "Projects" in navigation
- Create new projects with name, description, and status
- Edit existing projects (click "Edit" button)
- Delete projects (click "Delete" button with confirmation)

### 4. **Task Management**
- Click "Tasks" in navigation
- Create tasks with title, description, priority, and due date
- Assign tasks to projects
- Update task status using dropdown
- Edit or delete tasks using action buttons

## 🔧 Development Notes

### Current Implementation
- **Backend**: Node.js Express mock server with in-memory storage
- **Frontend**: React 18 with modern hooks and context API
- **Authentication**: JWT-like token system
- **Data Persistence**: In-memory (resets on server restart)

### Future Enhancements
- Real database integration (PostgreSQL/MongoDB)
- Real-time updates with WebSockets
- File attachments for tasks
- Team member collaboration features
- Advanced reporting and analytics

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or issues:
- Create an issue on GitHub
- Check the troubleshooting section below
- Review the API documentation

### 🔧 Troubleshooting

**Port Already in Use**: 
```bash
# Kill process on port 8081
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

**Authentication Issues**:
- Clear browser localStorage
- Restart both frontend and backend servers
- Check console for error messages

**API Connection Errors**:
- Ensure mock server is running on port 8081
- Check browser network tab for failed requests
- Verify CORS is enabled in mock server
