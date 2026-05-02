# Team Task Manager - Production Deployment Guide

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)
```bash
# Run the automated build and deploy script
deployment\build_and_deploy.bat
```

### Option 2: Manual Deployment
```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Setup deployment directory
mkdir deployment\dist
mkdir deployment\dist\frontend
mkdir deployment\dist\backend

# 3. Copy files
xcopy frontend\build\* deployment\dist\frontend\ /E /I /Y
copy mock-server.js deployment\dist\backend\
xcopy data\* deployment\dist\backend\data\ /E /I /Y

# 4. Install dependencies
cd deployment
npm install

# 5. Start server
npm start
```

## 📋 Prerequisites

### On Host Machine:
- Node.js (v14 or higher)
- npm
- Git
- Windows (for .bat scripts)

### Network Requirements:
- All laptops on same network
- Firewall allowing Node.js connections
- IP address: 10.65.65.179 (update if different)

## 🔧 Configuration

### Update IP Address:
Edit these files and replace `10.65.65.179` with your actual IP:
- `deployment/production_server.js` (line with server console.log)
- `deployment/start_production.bat`
- Any documentation files

### Check Firewall:
1. Windows Defender Firewall
2. Allow Node.js through firewall
3. Open ports: 3000 (frontend), 8081 (backend)

## 🌐 Access URLs

### Production Server:
- **Frontend:** http://10.65.65.179:3000
- **Backend API:** http://10.65.65.179:8081
- **Health Check:** http://10.65.65.179:8081/api/health

### Default Login:
- **Admin:** Suchitra Kamala / Suchitra1325
- **Members:** Register new accounts

## 📱 Access from Other Laptops

### Step 1: Ensure Network Connectivity
```bash
# Test from other laptop
ping 10.65.65.179
```

### Step 2: Access Application
Open browser and go to: http://10.65.65.179:3000

### Step 3: Troubleshooting
- Clear browser cache
- Try different browsers
- Check network connection
- Verify firewall settings

## 🗂️ File Structure After Deployment

```
deployment/
├── dist/
│   ├── frontend/           # React build files
│   ├── backend/            # Backend server files
│   │   ├── data/          # Persistent data files
│   │   └── mock-server.js # Backend server
│   └── README.md          # Quick start guide
├── production_server.js   # Production server
├── package.json          # Dependencies
├── start_production.bat   # Startup script
└── build_and_deploy.bat   # Build script
```

## 🔧 Maintenance

### Update Application:
1. Make changes to source code
2. Run `deployment\build_and_deploy.bat`
3. Restart servers

### Backup Data:
```bash
# Backup persistent data
copy deployment\dist\backend\data\* backup\
```

### Monitor Logs:
- Console output shows server status
- Check for errors in startup scripts

## 🚨 Troubleshooting

### Common Issues:

1. **Port Already in Use**
   ```bash
   # Find and kill process using port
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Firewall Blocking**
   - Allow Node.js through Windows Firewall
   - Open ports 3000 and 8081

3. **Network Access Issues**
   - Verify IP address with `ipconfig`
   - Check all devices on same network
   - Test with different browsers

4. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check for missing dependencies

## 📞 Support

### If Issues Persist:
1. Check this guide
2. Run diagnostic script
3. Verify network configuration
4. Contact IT support for network issues

---

## 🎯 Success Indicators

✅ Production server starts without errors
✅ Frontend accessible at http://10.65.65.179:3000
✅ Backend API responding at http://10.65.65.179:8081
✅ Other laptops can access the application
✅ Data persists between server restarts
✅ All features work (login, dashboard, tasks, projects)
