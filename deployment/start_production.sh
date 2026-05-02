#!/bin/bash

echo "Starting Team Task Manager Production Server..."
echo "=========================================="
echo

# Get the current IP address
IP=$(hostname -I | awk '{print $1}')

echo "Frontend: http://$IP:3000"
echo "Backend:  http://$IP:8081"
echo

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "Installing serve package..."
    npm install -g serve
fi

# Start backend server
echo "Starting backend server..."
cd backend
node production_server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
serve -s build -l 3000 &
FRONTEND_PID=$!

echo
echo "=========================================="
echo "Servers started successfully!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Access URLs:"
echo "  Frontend: http://$IP:3000"
echo "  Backend:  http://$IP:8081"
echo
echo "Press Ctrl+C to stop both servers"
echo

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap for Ctrl+C
trap cleanup INT

# Wait for processes
wait
