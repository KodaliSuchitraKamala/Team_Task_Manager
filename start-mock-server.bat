@echo off
echo Starting Mock Server for Team Task Manager...
echo.
echo Installing dependencies (if needed)...
call npm install express cors
echo.
echo Starting server...
echo Server will run on http://localhost:8081
echo Press Ctrl+C to stop the server
echo.
node mock-server.js
pause
