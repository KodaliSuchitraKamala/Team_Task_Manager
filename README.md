# Team Task Manager

A full-stack web application for team project and task management with role-based access control.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Role-based Access**: Admin and Member roles with different permissions
- **Project Management**: Create, update, and manage projects
- **Task Management**: Create tasks, assign to team members, track status
- **Dashboard**: Overview of projects, tasks, and statistics
- **Real-time Updates**: Task status tracking and overdue notifications

## Tech Stack

### Backend
- **Java 17** with Spring Boot 3.2.0
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **H2 Database** (development) / **PostgreSQL** (production)
- **Maven** for dependency management

### Frontend
- **React 18** with functional components
- **React Router** for navigation
- **Axios** for API calls
- **CSS** for styling

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd team-task-manager
```

2. Run the backend:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task by ID
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/overdue` - Get overdue tasks

## Deployment on Railway

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically detect the Spring Boot application
4. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - Application port (default: 8080)

5. Deploy the frontend separately or use a build process to serve static files

## Environment Variables

### Backend
- `DATABASE_URL` - Database connection URL
- `JWT_SECRET` - JWT token secret
- `PORT` - Server port

### Frontend
- `REACT_APP_API_URL` - Backend API URL

## Default Users

After registration, users can have the following roles:
- **ADMIN**: Full access to all features
- **MEMBER**: Limited access to assigned projects and tasks

## Database Schema

### Users
- id, username, password, email, role

### Projects
- id, name, description, status, created_by_id, created_at

### Tasks
- id, title, description, status, priority, project_id, assigned_to_id, created_by_id, created_at, due_date

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
