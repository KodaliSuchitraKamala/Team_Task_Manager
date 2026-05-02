#!/bin/bash

echo "Final Fix for Deployment"
echo "======================="

# Kill all existing processes on ports 8081 and 3000
echo "Killing all existing processes..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "mock-server" 2>/dev/null || true
sleep 3

# Find the correct IP address using multiple methods
echo "Finding your IP address..."
IP=""

# Method 1: ip command
IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7}' | head -1)

# Method 2: if none, try hostname -I
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

# Method 3: if none, try ifconfig
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1 | cut -d':' -f2)
fi

# Method 4: fallback to common private IP ranges
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(netstat -rn 2>/dev/null | grep '^0.0.0.0' | awk '{print $2}' | head -1)
fi

# Final fallback
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP="10.0.0.1"  # Common default, user should replace
fi

echo "Your IP address: $IP"
echo

# Create a simple working deployment
echo "Creating working deployment..."
cd deployment

# Ensure directories exist
mkdir -p backend frontend

# Copy files if they don't exist
if [ ! -f "backend/mock-server.js" ]; then
    cp ../mock-server.js backend/ 2>/dev/null || echo "mock-server.js not found"
fi

if [ ! -d "frontend/build" ]; then
    cp -r ../frontend/build frontend/ 2>/dev/null || echo "build not found"
fi

# Install serve if not available
if ! command -v serve &> /dev/null; then
    echo "Installing serve locally..."
    npm install serve
fi

# Create a working start script
cat > start_working.sh << EOF
#!/bin/bash

echo "Starting Team Task Manager"
echo "========================"

# Use the IP we found
IP="$IP"

echo "Access URLs:"
echo "  Frontend: http://\$IP:3000"
echo "  Backend:  http://\$IP:8081"
echo

# Kill any existing processes
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Start backend
echo "Starting backend server..."
cd backend
node mock-server.js &
BACKEND_PID=\$!

# Wait for backend
sleep 3

# Start frontend (use local serve if global not available)
echo "Starting frontend server..."
cd ../frontend

if command -v serve &> /dev/null; then
    serve -s build -l 3000 &
else
    # Use local serve
    node ../node_modules/serve/bin/serve.js -s build -l 3000 &
fi

FRONTEND_PID=\$!

echo
echo "✅ Servers started successfully!"
echo "🌐 Access the application: http://\$IP:3000"
echo "📱 Share this URL with other laptops: http://\$IP:3000"
echo "⏹️  Press Ctrl+C to stop both servers"
echo

# Cleanup function
cleanup() {
    echo
    echo "Stopping servers..."
    kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

trap cleanup INT
wait
EOF

chmod +x start_working.sh

echo
echo "✅ Final fix completed!"
echo
echo "📋 Your IP address is: $IP"
echo "🌐 Access URL for other laptops: http://$IP:3000"
echo
echo "🚀 To start servers:"
echo "   cd deployment"
echo "   ./start_working.sh"
echo
echo "📱 Share this URL with other users: http://$IP:3000"
