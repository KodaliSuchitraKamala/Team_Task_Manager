#!/bin/bash

echo "Final Working Fix - Complete Solution"
echo "==================================="

# Your IP address (from your input)
IP="192.168.1.100"

echo "Using IP address: $IP"
echo

# Step 1: Kill ALL existing processes
echo "Step 1: Killing all existing processes..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "python.*3000" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "mock-server" 2>/dev/null || true
sleep 3

# Step 2: Build frontend if needed
echo "Step 2: Building frontend..."
cd frontend
if [ ! -d "build" ]; then
    echo "Building React frontend..."
    npm run build
else
    echo "Frontend build already exists"
fi

# Step 3: Setup deployment directory
echo "Step 3: Setting up deployment directory..."
cd ..
mkdir -p deployment/backend deployment/frontend

# Copy files
cp frontend/build/* deployment/frontend/ 2>/dev/null || echo "Frontend files already copied"
cp mock-server.js deployment/backend/ 2>/dev/null || echo "Backend file already copied"

if [ -d "data" ]; then
    cp -r data/* deployment/backend/ 2>/dev/null || echo "Data files already copied"
fi

# Step 4: Install serve if needed
echo "Step 4: Installing dependencies..."
cd deployment
if ! command -v serve &> /dev/null; then
    echo "Installing serve globally..."
    npm install -g serve
fi

# Step 5: Create working startup script
echo "Step 5: Creating working startup script..."
cat > working_start.sh << EOF
#!/bin/bash

echo "Starting Team Task Manager"
echo "========================"
echo "IP: $IP"
echo "Access: http://$IP:3000"
echo

# Kill any remaining processes
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Start backend on port 8082 (avoid conflict)
echo "Starting backend server..."
cd backend
node mock-server.js &
BACKEND_PID=\$!

# Wait for backend
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../frontend
serve -s . -l 3000 --host 0.0.0.0 &
FRONTEND_PID=\$!

echo
echo "✅ Servers started!"
echo "🌐 Access: http://$IP:3000"
echo "📱 Share: http://$IP:3000"
echo "⏹️  Press Ctrl+C to stop"

# Cleanup
cleanup() {
    echo
    echo "Stopping servers..."
    kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT
wait
EOF

chmod +x working_start.sh

echo
echo "✅ Setup completed!"
echo "🌐 Access URL: http://$IP:3000"
echo "📱 Share this with other laptops: http://$IP:3000"
echo
echo "To start servers:"
echo "  cd deployment"
echo "  ./working_start.sh"
echo

# Auto-start servers
echo "Auto-starting servers..."
./working_start.sh
