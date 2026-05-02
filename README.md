# Team Task Manager

A full-stack web application for team project and task management with role-based access control, complete CRUD operations, and modern UI. Features network deployment for multi-user access across different laptops.

## 🚀 Features

- **Authentication System**: User registration and login with JWT tokens
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Complete CRUD operations for tasks with status tracking
- **Edit/Delete for Own Tasks**: Members can edit and delete tasks they created
- **Dashboard**: Real-time statistics and overview of projects and tasks
- **Task Status Updates**: Quick status changes (To Do, In Progress, In Review, Completed)
- **Priority Management**: Task priority levels (Low, Medium, High, Urgent)
- **Due Date Tracking**: Task deadlines and overdue notifications
- **Responsive Design**: Modern UI that works on all devices
- **Navigation**: Seamless navigation between pages without authentication loss
- **Network Deployment**: Accessible from multiple laptops on the same network
- **Persistent Data Storage**: JSON-based data persistence across server restarts

## 🛠️ Tech Stack

### Backend (Mock Server)
- **Node.js** with Express.js for REST API
- **Persistent JSON storage** for data persistence across restarts
- **CORS enabled** for frontend integration
- **Network binding** (0.0.0.0) for multi-device access
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

### Network Deployment (Multi-Laptop Access)

The Team Task Manager is configured for network deployment, allowing multiple users on the same network to access the application simultaneously.

#### Quick Network Setup

1. **Automatic Deployment Script**:
```bash
chmod +x final_working_solution.sh && ./final_working_solution.sh
```

2. **Manual Deployment**:
```bash
# Build frontend
cd frontend && npm run build

# Setup production directory
cd .. && mkdir -p production/backend production/frontend

# Copy files
cp -r frontend/build/* production/frontend/
cp mock-server.js production/backend/

# Start servers
cd production
./start_team_manager.sh
```

3. **Access URLs**:
   - **Local**: `http://localhost:3000`
   - **Network**: `http://YOUR_IP:3000` (share with other laptops)
   - **Backend API**: `http://YOUR_IP:8081`

#### Troubleshooting Network Access

If other laptops can't access the application:

1. **Check Network Connectivity**:
```bash
# Test your IP
ping YOUR_IP

# Check firewall
sudo ufw allow 3000
sudo ufw allow 8081
```

2. **Use Network Diagnostic Script**:
```bash
chmod +x network_troubleshoot.sh && ./network_troubleshoot.sh
```

3. **Common Issues**:
   - Ensure all laptops are on same WiFi/network
   - Check firewall settings
   - Try different browsers on other laptops
   - Verify IP address is correct

#### Deployment Scripts Available

- `final_working_solution.sh` - Complete automated deployment
- `network_troubleshoot.sh` - Network connectivity diagnostics
- `simple_working_server.sh` - Basic server testing
- `correct_deployment.sh` - Production deployment setup

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
│   ├── build/               # Production build output
│   └── package.json         # Frontend dependencies
├── mock-server.js           # Node.js Express backend
├── data/                    # Persistent data storage
│   ├── users.json          # User accounts
│   ├── projects.json       # Project data
│   └── tasks.json          # Task data
├── deployment/              # Deployment configuration
│   ├── backend/            # Backend files for deployment
│   ├── frontend/           # Frontend build files
│   └── start_team_manager.sh # Production startup script
├── working_solution/        # Working deployment solution
│   ├── backend/            # Configured backend
│   ├── frontend/           # Frontend build
│   └── start_working.sh    # Working startup script
├── production/              # Production deployment
│   ├── backend/            # Production backend
│   ├── frontend/           # Production frontend
│   ├── start_team_manager.sh # Startup script
│   └── test_network.sh     # Network testing script
├── final_working_solution.sh # Complete deployment solution
├── network_troubleshoot.sh   # Network diagnostics
├── simple_working_server.sh  # Basic server testing
├── correct_deployment.sh      # Production deployment
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
- **Backend**: Node.js Express mock server with persistent JSON storage
- **Frontend**: React 18 with modern hooks and context API
- **Authentication**: JWT-like token system with proper user ID encoding
- **Data Persistence**: JSON-based storage (survives server restarts)
- **Network Deployment**: Configured for multi-device access on same network
- **Task Ownership**: Members can edit/delete tasks they created
- **Production Ready**: Multiple deployment scripts and troubleshooting tools

### Key Features Implemented
- **Edit/Delete for Own Tasks**: Members see edit/delete buttons only for tasks they created
- **Network Access**: Application accessible from multiple laptops
- **Persistent Storage**: Data saved in JSON files in `data/` directory
- **Automatic Deployment**: Scripts for easy network deployment
- **Troubleshooting Tools**: Comprehensive network diagnostic scripts

### Deployment Scripts Available
- `final_working_solution.sh` - Complete automated deployment with IP detection
- `network_troubleshoot.sh` - Network connectivity diagnostics and fixes
- `simple_working_server.sh` - Basic server for testing
- `correct_deployment.sh` - Production deployment setup
- `ultimate_fix.sh` - Alternative deployment with port changes

### Future Enhancements
- Real database integration (PostgreSQL/MongoDB)
- Real-time updates with WebSockets
- File attachments for tasks
- Team member collaboration features
- Advanced reporting and analytics
- Mobile application deployment

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

#### Network Deployment Issues

**"This site can't be reached" or "took too long to respond"**:
```bash
# Run network diagnostics
chmod +x network_troubleshoot.sh && ./network_troubleshoot.sh

# Check your IP address
hostname -I

# Test connectivity
ping YOUR_IP

# Check firewall settings
sudo ufw allow 3000
sudo ufw allow 8081
```

**Port Already in Use**: 
```bash
# Kill processes on ports 8081 and 3000
pkill -f "node.*8081"
pkill -f "serve.*3000"

# Alternative: Use different ports
chmod +x ultimate_fix.sh && ./ultimate_fix.sh
```

**Other Laptops Can't Access**:
1. Ensure all laptops are on same WiFi/network
2. Check IP address is correct
3. Test with different browsers
4. Run network diagnostic script
5. Check firewall settings

**Server Not Starting**:
```bash
# Use simple working server
chmod +x simple_working_server.sh && ./simple_working_server.sh

# Or use complete solution
chmod +x final_working_solution.sh && ./final_working_solution.sh
```

#### General Issues

**Authentication Issues**:
- Clear browser localStorage
- Restart both frontend and backend servers
- Check console for error messages
- Verify JWT token is properly generated

**API Connection Errors**:
- Ensure mock server is running on port 8081
- Check browser network tab for failed requests
- Verify CORS is enabled in mock server
- Test with `curl http://localhost:8081/api/health`

**Edit/Delete Buttons Not Showing**:
- Check if user is logged in
- Verify task was created by the current user
- Check browser console for JavaScript errors
- Ensure createdBy field is properly set

#### Common Solutions

1. **Quick Fix for Network Issues**:
```bash
chmod +x final_working_solution.sh && ./final_working_solution.sh
```

2. **Test Server Only**:
```bash
chmod +x simple_working_server.sh && ./simple_working_server.sh
```

3. **Complete Deployment**:
```bash
chmod +x correct_deployment.sh && ./correct_deployment.sh
```

4. **Network Diagnostics**:
```bash
chmod +x network_troubleshoot.sh && ./network_troubleshoot.sh
```
