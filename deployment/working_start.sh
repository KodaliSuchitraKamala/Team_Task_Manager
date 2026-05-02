#!/bin/bash

echo "Starting Team Task Manager"
echo "========================"
echo "IP: 192.168.1.100"
echo "Access: http://192.168.1.100:3000"
echo

# Kill any remaining processes
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Start backend on port 8082 (avoid conflict)
echo "Starting backend server..."
cd backend
node mock-server.js &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../frontend
serve -s . -l 3000 --host 0.0.0.0 &
FRONTEND_PID=$!

echo
echo "✅ Servers started!"
echo "🌐 Access: http://192.168.1.100:3000"
echo "📱 Share: http://192.168.1.100:3000"
echo "⏹️  Press Ctrl+C to stop"

# Cleanup
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT
wait
