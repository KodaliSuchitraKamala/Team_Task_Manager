@echo off
echo Finding process using port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Killing process %%a...
    taskkill /PID %%a /F
)
echo Done!
pause
