# Team Task Manager - Linux Deployment Guide

## 🚀 Quick Deployment for Linux

### Step 1: Make Scripts Executable
```bash
chmod +x deployment/build_and_deploy.sh
chmod +x deployment/start_production.sh
```

### Step 2: Run Build and Deploy
```bash
./deployment/build_and_deploy.sh
```

### Step 3: Start Production Server
```bash
cd deployment
./start_production.sh
```

## 📋 Prerequisites for Linux

### Required Packages:
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use snap
sudo snap install node --classic

# Install serve globally
npm install -g serve
```

### Check Installation:
```bash
node --version
npm --version
```

## 🔧 Linux-Specific Configuration

### Get Your IP Address:
```bash
# Get your local IP address
hostname -I | awk '{print $1}'

# Or use
ip addr show | grep 'inet ' | grep -v 127.0.0.1
```

### Update IP in Configuration:
Edit these files and replace `10.65.65.179` with your actual IP:
- `deployment/production_server.js`
- `deployment/start_production.sh`

## 🌐 Access URLs

### After Starting Server:
- **Frontend:** http://YOUR_IP:3000
- **Backend API:** http://YOUR_IP:8081
- **Health Check:** http://YOUR_IP:8081/api/health

### Example:
If your IP is `192.168.1.100`:
- Frontend: http://192.168.1.100:3000
- Backend: http://192.168.1.100:8081

## 📱 Access from Other Laptops

### Step 1: Find Your IP
```bash
hostname -I | awk '{print $1}'
```

### Step 2: Share the URL
Tell other users to access: `http://YOUR_IP:3000`

### Step 3: Troubleshooting
```bash
# Check if ports are open
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8081

# Check firewall
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 8081
```

## 🔧 Linux Commands

### Start Servers:
```bash
cd deployment
./start_production.sh
```

### Stop Servers:
```bash
# Press Ctrl+C in the terminal
# Or find and kill processes
ps aux | grep node
kill -9 <PID>
```

### Check Server Status:
```bash
curl http://localhost:8081/api/health
```

## 🗂️ File Structure

```
deployment/
├── build_and_deploy.sh    # Build script (Linux)
├── start_production.sh    # Startup script (Linux)
├── production_server.js   # Production server
├── package.json          # Dependencies
├── dist/                 # Built application
│   ├── frontend/         # React build
│   └── backend/          # Backend files
└── README.md             # Quick start
```

## 🚨 Linux Troubleshooting

### Permission Issues:
```bash
# Make scripts executable
chmod +x *.sh

# If needed, change ownership
sudo chown $USER:$USER *.sh
```

### Port Already in Use:
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8081

# Kill process
sudo kill -9 <PID>
```

### Firewall Issues:
```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 8081

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload
```

### Dependencies Issues:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Success Indicators

✅ Scripts execute without permission errors
✅ Build completes successfully
✅ Servers start and show correct IP
✅ Frontend accessible at http://YOUR_IP:3000
✅ Backend API responding at http://YOUR_IP:8081
✅ Other laptops can access the application

## 📞 Quick Commands

```bash
# Quick deploy (run all at once)
chmod +x deployment/build_and_deploy.sh && ./deployment/build_and_deploy.sh && cd deployment && ./start_production.sh

# Check server status
curl http://localhost:8081/api/health

# Stop all Node.js processes
pkill -f node
```
