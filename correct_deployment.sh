#!/bin/bash

echo "Correct Team Task Manager Deployment"
echo "=================================="

# Your IP address
IP="192.168.1.100"

echo "Deploying Team Task Manager for network access"
echo "Target IP: $IP"
echo

# Step 1: Clean up everything
echo "Step 1: Cleaning up existing processes..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "node.*8082" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "serve.*3001" 2>/dev/null || true
pkill -f "python.*3000" 2>/dev/null || true
pkill -f "python.*3001" 2>/dev/null || true
sleep 3

# Step 2: Build frontend if needed
echo "Step 2: Building frontend..."
cd frontend
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo "Building React application..."
    npm run build
else
    echo "Frontend build exists"
fi

# Step 3: Setup proper deployment structure
echo "Step 3: Setting up deployment structure..."
cd ..
mkdir -p production/backend production/frontend

# Copy frontend build
cp -r frontend/build/* production/frontend/

# Copy backend files
cp mock-server.js production/backend/

# Copy data if exists
if [ -d "data" ]; then
    cp -r data/* production/backend/
fi

# Step 4: Configure backend for network access
echo "Step 4: Configuring backend for network access..."
cd production/backend

# Update mock-server.js to bind to all interfaces
sed -i 's/app.listen(port,/app.listen(port, '\''0.0.0.0'\'',/' mock-server.js

# Step 5: Install dependencies
echo "Step 5: Installing dependencies..."
cd ..
npm install express cors serve

# Step 6: Create production startup script
echo "Step 6: Creating production startup script..."
cat > start_team_manager.sh << EOF
#!/bin/bash

echo "🚀 Starting Team Task Manager"
echo "=========================="
echo "🌐 IP: $IP"
echo "🔧 Backend: http://$IP:8081"
echo "🌐 Frontend: http://$IP:3000"
echo

# Kill any existing processes
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Start backend server
echo "🔧 Starting backend server..."
cd backend
node mock-server.js &
BACKEND_PID=\$!

# Wait for backend to start
sleep 3

# Test backend
if curl -s http://localhost:8081/api/health > /dev/null; then
    echo "✅ Backend server is responding"
else
    echo "❌ Backend server not responding"
fi

# Start frontend server
echo "🌐 Starting frontend server..."
cd ../frontend
npx serve -s . -l 3000 --host 0.0.0.0 &
FRONTEND_PID=\$!

# Wait for frontend to start
sleep 3

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server is responding"
else
    echo "❌ Frontend server not responding"
fi

echo
echo "🎉 Team Task Manager is ready!"
echo "📱 Share this link: http://$IP:3000"
echo "🔧 API endpoint: http://$IP:8081"
echo
echo "📋 Default Login:"
echo "   Username: Suchitra Kamala"
echo "   Password: Suchitra1325"
echo
echo "⏹️  Press Ctrl+C to stop servers"

# Cleanup function
cleanup() {
    echo
    echo "🛑 Stopping Team Task Manager..."
    kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

trap cleanup INT
wait
EOF

chmod +x start_team_manager.sh

# Step 7: Create network test script
echo "Step 7: Creating network test script..."
cat > test_network.sh << EOF
#!/bin/bash

echo "🔍 Testing Network Connectivity"
echo "============================"
echo "Target IP: $IP"
echo

echo "1. Testing local connectivity..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend accessible locally"
else
    echo "❌ Frontend not accessible locally"
fi

if curl -s http://localhost:8081/api/health > /dev/null; then
    echo "✅ Backend accessible locally"
else
    echo "❌ Backend not accessible locally"
fi

echo
echo "2. Testing network connectivity..."
if ping -c 3 $IP > /dev/null 2>&1; then
    echo "✅ Ping to $IP successful"
else
    echo "❌ Ping to $IP failed - network issue!"
fi

echo
echo "3. Port status..."
netstat -tlnp 2>/dev/null | grep -E ":(3000|8081)" || echo "No servers found on ports 3000/8081"

echo
echo "📱 Instructions for other laptops:"
echo "================================="
echo "1. Ensure both laptops are on same WiFi/network"
echo "2. Open browser and go to: http://$IP:3000"
echo "3. If it doesn't work:"
echo "   - Try pinging $IP from other laptop"
echo "   - Check firewall settings"
echo "   - Try different browser"
EOF

chmod +x test_network.sh

echo
echo "✅ Deployment completed successfully!"
echo
echo "📁 Deployment location: production/"
echo "🚀 To start: cd production && ./start_team_manager.sh"
echo "🔍 To test: cd production && ./test_network.sh"
echo
echo "🌐 Access URL for other laptops: http://$IP:3000"
echo

# Auto-start the application
echo "🚀 Auto-starting Team Task Manager..."
./start_team_manager.sh
