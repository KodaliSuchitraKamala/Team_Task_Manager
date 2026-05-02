@echo off
echo Team Task Manager - Production Build and Deploy
echo ==============================================
echo.

echo 1. Creating production build...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check for errors above.
    pause
    exit /b 1
)

echo.
echo 2. Creating deployment directory...
if not exist "..\deployment\dist" mkdir "..\deployment\dist"
if not exist "..\deployment\dist\frontend" mkdir "..\deployment\dist\frontend"

echo.
echo 3. Copying build files...
xcopy "build\*" "..\deployment\dist\frontend\" /E /I /Y

echo.
echo 4. Copying backend files...
if not exist "..\deployment\dist\backend" mkdir "..\deployment\dist\backend"
copy "..\mock-server.js" "..\deployment\dist\backend\"
if exist "..\data" xcopy "..\data\*" "..\deployment\dist\backend\data\" /E /I /Y

echo.
echo 5. Creating production server configuration...
echo const express = require('express'); > "..\deployment\dist\backend\package.json"
echo const cors = require('cors'); >> "..\deployment\dist\backend\package.json"
echo const fs = require('fs'); >> "..\deployment\dist\backend\package.json"
echo const path = require('path'); >> "..\deployment\dist\backend\package.json"

echo.
echo 6. Creating startup scripts...
echo @echo off > "..\deployment\start_production.bat"
echo echo Starting Team Task Manager Production Server... >> "..\deployment\start_production.bat"
echo echo. >> "..\deployment\start_production.bat"
echo echo Frontend: http://10.65.65.179:3000 >> "..\deployment\start_production.bat"
echo echo Backend:  http://10.65.65.179:8081 >> "..\deployment\start_production.bat"
echo echo. >> "..\deployment\start_production.bat"
echo cd backend >> "..\deployment\start_production.bat"
echo start "Backend Server" cmd /k "node mock-server.js" >> "..\deployment\start_production.bat"
echo cd .. >> "..\deployment\start_production.bat"
echo cd frontend >> "..\deployment\start_production.bat"
echo start "Frontend Server" cmd /k "npx serve -s build -l 3000" >> "..\deployment\start_production.bat"
echo cd .. >> "..\deployment\start_production.bat"
echo echo. >> "..\deployment\start_production.bat"
echo echo Both servers are starting... >> "..\deployment\start_production.bat"
echo echo Frontend will be available at: http://10.65.65.179:3000 >> "..\deployment\start_production.bat"
echo echo Backend API at: http://10.65.65.179:8081 >> "..\deployment\start_production.bat"
echo pause >> "..\deployment\start_production.bat"

echo.
echo 7. Creating README for deployment...
echo # Team Task Manager - Production Deployment > "..\deployment\dist\README.md"
echo. >> "..\deployment\dist\README.md"
echo ## Quick Start >> "..\deployment\dist\README.md"
echo 1. Run: start_production.bat >> "..\deployment\dist\README.md"
echo 2. Open browser: http://10.65.65.179:3000 >> "..\deployment\dist\README.md"
echo. >> "..\deployment\dist\README.md"
echo ## Default Login >> "..\deployment\dist\README.md"
echo - Admin: Suchitra Kamala / Suchitra1325 >> "..\deployment\dist\README.md"
echo - Member: Register new account >> "..\deployment\dist\README.md"
echo. >> "..\deployment\dist\README.md"
echo ## Access URLs >> "..\deployment\dist\README.md"
echo - Frontend: http://10.65.65.179:3000 >> "..\deployment\dist\README.md"
echo - Backend API: http://10.65.65.179:8081 >> "..\deployment\dist\README.md"

echo.
echo ==============================================
echo Build completed successfully!
echo.
echo Deployment files are in: deployment\dist\
echo.
echo To start the production server:
echo 1. Go to deployment directory
echo 2. Run: start_production.bat
echo 3. Access: http://10.65.65.179:3000
echo.
pause
