#!/bin/bash

echo "Fixing Deployment Issues"
echo "======================="

# Install serve globally
echo "Installing serve globally..."
npm install -g serve

# Get IP address (compatible with different systems)
IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -1)
if [ -z "$IP" ]; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$IP" ]; then
    IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1 | cut -d':' -f2)
fi
if [ -z "$IP" ]; then
    IP="localhost"
fi

echo "Your IP address: $IP"

# Fix directory structure
echo "Fixing directory structure..."
cd deployment
mkdir -p backend frontend

# Copy files to correct locations
if [ -f "mock-server.js" ]; then
    cp mock-server.js backend/
fi

if [ -d "dist/frontend" ]; then
    cp -r dist/frontend/* frontend/
fi

if [ -d "dist/backend" ]; then
    cp -r dist/backend/* backend/
fi

# Create proper start script
echo "Creating proper start script..."
cat > start.sh << EOF
#!/bin/bash

echo "Starting Team Task Manager Servers"
echo "================================="

# Get IP address
IP=\$(ip route get 1.1.1.1 2>/dev/null | awk '{print \$7}' | head -1)
if [ -z "\$IP" ]; then
    IP=\$(hostname -I 2>/dev/null | awk '{print \$1}')
fi
if [ -z "\$IP" ]; then
    IP=\$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print \$2}' | head -1 | cut -d':' -f2)
fi
if [ -z "\$IP" ]; then
    IP="localhost"
fi

echo "Access URLs:"
echo "  Frontend: http://\$IP:3000"
echo "  Backend:  http://\$IP:8081"
echo

# Kill existing processes
echo "Stopping existing servers..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Start backend server
echo "Starting backend server..."
cd backend
node mock-server.js &
BACKEND_PID=\$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
serve -s build -l 3000 &
FRONTEND_PID=\$!

echo
echo "Servers started successfully!"
echo "Backend PID: \$BACKEND_PID"
echo "Frontend PID: \$FRONTEND_PID"
echo
echo "Access the application: http://\$IP:3000"
echo "Press Ctrl+C to stop both servers"
echo

# Cleanup function
cleanup() {
    echo
    echo "Stopping servers..."
    kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap for Ctrl+C
trap cleanup INT

# Wait for processes
wait
EOF

chmod +x start.sh

echo
echo "Deployment fixed!"
echo "To start servers: ./start.sh"
echo "Access: http://$IP:3000"
