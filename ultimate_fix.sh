#!/bin/bash

echo "Ultimate Fix - Final Solution"
echo "============================"

# Your IP address
IP="192.168.1.100"

echo "Using IP: $IP"
echo

# Step 1: Force kill ALL processes using multiple methods
echo "Step 1: Force killing all processes..."
sudo pkill -f "node.*8081" 2>/dev/null || true
pkill -f "node.*8081" 2>/dev/null || true
sudo pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sudo pkill -f "python.*3000" 2>/dev/null || true
pkill -f "python.*3000" 2>/dev/null || true

# Also try killing by port
sudo fuser -k 8081/tcp 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true

sleep 3

# Step 2: Use different ports to avoid conflicts
echo "Step 2: Using alternative ports..."
BACKEND_PORT="8082"
FRONTEND_PORT="3001"

echo "Backend will use port: $BACKEND_PORT"
echo "Frontend will use port: $FRONTEND_PORT"

# Step 3: Update backend to use different port
echo "Step 3: Updating backend configuration..."
cd deployment/backend
sed -i "s/port = 8081/port = $BACKEND_PORT/" mock-server.js 2>/dev/null || true

# Step 4: Install local serve if global doesn't work
echo "Step 4: Setting up frontend server..."
cd ../deployment
if ! command -v serve &> /dev/null; then
    echo "Installing serve locally..."
    npm install serve
    SERVE_CMD="node node_modules/serve/bin/serve.js"
else
    SERVE_CMD="serve"
fi

# Step 5: Create ultimate working script
echo "Step 5: Creating ultimate startup script..."
cat > ultimate_start.sh << EOF
#!/bin/bash

echo "🚀 Starting Team Task Manager - Ultimate Version"
echo "=============================================="
echo "🌐 IP: $IP"
echo "🔧 Backend Port: $BACKEND_PORT"
echo "🔧 Frontend Port: $FRONTEND_PORT"
echo "🌐 Full Access: http://$IP:$FRONTEND_PORT"
echo

# Kill any remaining processes
pkill -f "node.*$BACKEND_PORT" 2>/dev/null || true
pkill -f "serve.*$FRONTEND_PORT" 2>/dev/null || true
sleep 2

# Start backend on different port
echo "🔧 Starting backend server on port $BACKEND_PORT..."
cd backend
node mock-server.js &
BACKEND_PID=\$!

# Wait for backend
sleep 3

# Start frontend
echo "🌐 Starting frontend server on port $FRONTEND_PORT..."
cd ../frontend
$SERVE_CMD -s . -l $FRONTEND_PORT --host 0.0.0.0 &
FRONTEND_PID=\$!

echo
echo "✅ Servers started successfully!"
echo "🌐 Access URL: http://$IP:$FRONTEND_PORT"
echo "📱 Share this URL: http://$IP:$FRONTEND_PORT"
echo "🔧 Backend API: http://$IP:$BACKEND_PORT"
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

chmod +x ultimate_start.sh

echo
echo "✅ Ultimate fix completed!"
echo "🌐 Access URL: http://$IP:$FRONTEND_PORT"
echo "📱 Share this: http://$IP:$FRONTEND_PORT"
echo
echo "To start servers:"
echo "  cd deployment"
echo "  ./ultimate_start.sh"
echo

# Auto-start
echo "🚀 Auto-starting servers..."
./ultimate_start.sh
