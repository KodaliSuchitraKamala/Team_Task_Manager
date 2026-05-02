# Installation Guide

## Prerequisites

### 1. Java Installation (Required)
The application requires Java 17 or higher.

**Check if Java is installed:**
```bash
java -version
```

**Install Java if not present:**
- Download from: https://adoptium.net/
- Choose Java 17 LTS or higher
- Install and add to PATH

### 2. Maven Installation (Required for development)

**Option 1: Automatic Installation (Windows)**
```bash
winget install Apache.Maven
```

**Option 2: Manual Installation**
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to: `C:\Program Files\Apache\maven`
3. Set environment variables:
   - `MAVEN_HOME = C:\Program Files\Apache\maven`
   - Add `%MAVEN_HOME%\bin` to PATH

**Verify Maven installation:**
```bash
mvn -version
```

## Running the Application

### Method 1: Using the provided script (Recommended)
```bash
run-app.bat
```

### Method 2: Manual Maven execution
```bash
mvn spring-boot:run
```

### Method 3: Using Maven Wrapper (if Maven not installed globally)
```bash
.\mvnw.cmd spring-boot:run
```

## Frontend Setup

### Install Node.js (if not installed)
Download from: https://nodejs.org/

### Install dependencies and run frontend
```bash
cd frontend
npm install
npm start
```

## Access Points

- **Backend API**: http://localhost:8080
- **Frontend App**: http://localhost:3000
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: `password`

## Default Database

The application uses H2 in-memory database by default. All data will be lost when the application stops.

For production deployment, configure PostgreSQL database as shown in the Railway deployment section.

## Troubleshooting

### "mvn command not found"
- Install Maven following the steps above
- Restart command prompt after installation
- Verify MAVEN_HOME is set correctly

### "java command not found"
- Install Java 17 or higher
- Add Java to system PATH
- Restart command prompt

### Port already in use
- Kill the process using the port:
  ```bash
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```
- Or change the port in `application.properties`

## Railway Deployment

For production deployment, the application is configured to work with Railway:

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: Application port (8080)

The application will automatically use PostgreSQL in production.
