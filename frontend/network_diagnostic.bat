@echo off
echo Network Diagnostic for Team Task Manager
echo ========================================
echo.

echo 1. Checking your IP address:
ipconfig | findstr "IPv4"
echo.

echo 2. Checking if port 3000 is listening:
netstat -an | findstr :3000
echo.

echo 3. Checking if port 8081 is listening:
netstat -an | findstr :8081
echo.

echo 4. Testing local connection to React app:
curl http://localhost:3000 || echo Failed to connect to localhost:3000
echo.

echo 5. Testing local connection to mock server:
curl http://localhost:8081/api/health || echo Failed to connect to localhost:8081
echo.

echo 6. Checking Windows Firewall status:
netsh advfirewall show allprofiles
echo.

echo ========================================
echo If you see "LISTENING" for ports 3000 and 8081, servers are running.
echo If curl tests fail, there might be a local configuration issue.
echo ========================================
pause
