#!/bin/bash

echo "Team Task Manager - Linux Deployment"
echo "=================================="
echo

# Kill any existing processes on ports 8081 and 3000
echo "Stopping existing servers..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

sleep 2

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Get the current IP address
IP=$(hostname -I | awk '{print $1}')
echo "Your IP address: $IP"

# Create deployment directory
echo "Creating deployment directory..."
mkdir -p deployment/dist/frontend
mkdir -p deployment/dist/backend

# Build React frontend
echo "Building React frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed! Check for errors above."
    exit 1
fi

# Copy build files
echo "Copying build files..."
cp -r build/* ../deployment/dist/frontend/

# Copy backend files
echo "Copying backend files..."
cd ..
cp mock-server.js deployment/dist/backend/
if [ -d "data" ]; then
    cp -r data/* deployment/dist/backend/data/
fi

# Create production package.json
echo "Setting up production environment..."
cd deployment
cat > package.json << 'EOF'
{
  "name": "team-task-manager-production",
  "version": "1.0.0",
  "description": "Production deployment of Team Task Manager",
  "main": "production_server.js",
  "scripts": {
    "start": "node production_server.js",
    "start-frontend": "cd frontend && serve -s build -l 3000",
    "start-backend": "cd backend && node mock-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Install serve globally if not installed
if ! command -v serve &> /dev/null; then
    echo "Installing serve globally..."
    npm install -g serve
fi

# Create startup script
echo "Creating startup script..."
cat > start_servers.sh << EOF
#!/bin/bash

echo "Starting Team Task Manager Servers..."
echo "=================================="
echo

IP=\$(hostname -I | awk '{print \$1}')
echo "Your IP address: \$IP"
echo
echo "Access URLs:"
echo "  Frontend: http://\$IP:3000"
echo "  Backend:  http://\$IP:8081"
echo

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
echo "Servers started!"
echo "Backend PID: \$BACKEND_PID"
echo "Frontend PID: \$FRONTEND_PID"
echo
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

chmod +x start_servers.sh

echo
echo "=================================="
echo "Deployment completed successfully!"
echo
echo "To start the servers:"
echo "  cd deployment"
echo "  ./start_servers.sh"
echo
echo "Then access from other laptops:"
echo "  http://$IP:3000"
echo

cd ..
