#!/bin/bash

echo "Final Working Solution - Team Task Manager"
echo "======================================"

# Step 1: Find correct IP address first
echo "Step 1: Finding your correct IP address..."
REAL_IP=""

# Try to find the actual IP that works
if command -v ifconfig &> /dev/null; then
    REAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d':' -f2 | head -1)
fi

if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ]; then
    if command -v hostname &> /dev/null; then
        REAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
fi

if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ]; then
    echo "❌ Cannot determine IP address. Please enter it manually:"
    read -p "IP: " REAL_IP
fi

echo "Using IP: $REAL_IP"
echo

# Step 2: Force kill everything
echo "Step 2: Force killing all processes..."
sudo pkill -f "node.*8081" 2>/dev/null || true
pkill -f "node.*8081" 2>/dev/null || true
sudo pkill -f "node.*8082" 2>/dev/null || true
pkill -f "node.*8082" 2>/dev/null || true
sudo pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sudo pkill -f "serve.*3001" 2>/dev/null || true
pkill -f "serve.*3001" 2>/dev/null || true
sudo fuser -k 8081/tcp 2>/dev/null || true
sudo fuser -k 8082/tcp 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
sleep 3

# Step 3: Use different ports to avoid conflicts
BACKEND_PORT="8082"
FRONTEND_PORT="3001"

echo "Step 3: Using alternative ports to avoid conflicts"
echo "Backend port: $BACKEND_PORT"
echo "Frontend port: $FRONTEND_PORT"

# Step 4: Setup working directory
echo "Step 4: Setting up working directory..."
mkdir -p working_solution/backend working_solution/frontend

# Copy frontend build
cp -r frontend/build/* working_solution/frontend/ 2>/dev/null || echo "Frontend build already exists"

# Copy and configure backend
cp mock-server.js working_solution/backend/
cd working_solution/backend

# Update backend to use new port and bind to all interfaces
sed -i "s/port = 8081/port = $BACKEND_PORT/" mock-server.js
sed -i 's/app.listen(port,/app.listen(port, '\''0.0.0.0'\'',/' mock-server.js

# Step 5: Create working startup script
echo "Step 5: Creating working startup script..."
cd ..

cat > start_working.sh << EOF
#!/bin/bash

echo "🚀 Starting Team Task Manager - Working Solution"
echo "=============================================="
echo "🌐 IP: $REAL_IP"
echo "🔧 Backend: http://$REAL_IP:$BACKEND_PORT"
echo "🌐 Frontend: http://$REAL_IP:$FRONTEND_PORT"
echo

# Kill any remaining processes
pkill -f "node.*$BACKEND_PORT" 2>/dev/null || true
pkill -f "serve.*$FRONTEND_PORT" 2>/dev/null || true
sleep 2

# Start backend
echo "🔧 Starting backend server on port $BACKEND_PORT..."
cd backend
node mock-server.js &
BACKEND_PID=\$!

# Wait for backend
sleep 3

# Test backend
if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null; then
    echo "✅ Backend server responding"
else
    echo "❌ Backend server not responding"
fi

# Start frontend with Python (more reliable than serve)
echo "🌐 Starting frontend server on port $FRONTEND_PORT..."
cd ../frontend

if command -v python3 &> /dev/null; then
    echo "Using Python3 server..."
    python3 -m http.server $FRONTEND_PORT --bind 0.0.0.0 &
    FRONTEND_PID=\$!
elif command -v python &> /dev/null; then
    echo "Using Python server..."
    python -m SimpleHTTPServer $FRONTEND_PORT &
    FRONTEND_PID=\$!
else
    echo "Using serve (without --host option)..."
    npx serve -s . -l $FRONTEND_PORT &
    FRONTEND_PID=\$!
fi

# Wait for frontend
sleep 3

# Test frontend
if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
    echo "✅ Frontend server responding"
else
    echo "❌ Frontend server not responding"
fi

echo
echo "🎉 Team Task Manager is ready!"
echo "📱 Share this link: http://$REAL_IP:$FRONTEND_PORT"
echo "🔧 Backend API: http://$REAL_IP:$BACKEND_PORT"
echo
echo "📋 Default Login:"
echo "   Username: Suchitra Kamala"
echo "   Password: Suchitra1325"
echo
echo "⏹️  Press Ctrl+C to stop servers"

# Cleanup function
cleanup() {
    echo
    echo "🛑 Stopping servers..."
    kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

trap cleanup INT
wait
EOF

chmod +x start_working.sh

# Step 6: Test network connectivity
echo "Step 6: Testing network connectivity..."
if ping -c 2 $REAL_IP > /dev/null 2>&1; then
    echo "✅ Ping to $REAL_IP successful"
else
    echo "❌ Ping to $REAL_IP failed"
    echo "   This might be normal - some systems don't respond to their own IP"
    echo "   The application should still work for other laptops"
fi

echo
echo "✅ Working solution ready!"
echo
echo "📁 Location: working_solution/"
echo "🚀 To start: cd working_solution && ./start_working.sh"
echo
echo "🌐 Final access URL: http://$REAL_IP:$FRONTEND_PORT"
echo "📱 Share this with other laptops: http://$REAL_IP:$FRONTEND_PORT"
echo

# Auto-start
echo "🚀 Auto-starting Team Task Manager..."
./start_working.sh
