#!/bin/bash

echo "🚀 Starting Team Task Manager - Working Solution"
echo "=============================================="
echo "🌐 IP: 192.168.1.100"
echo "🔧 Backend: http://192.168.1.100:8082"
echo "🌐 Frontend: http://192.168.1.100:3001"
echo

# Kill any remaining processes
pkill -f "node.*8082" 2>/dev/null || true
pkill -f "serve.*3001" 2>/dev/null || true
sleep 2

# Start backend
echo "🔧 Starting backend server on port 8082..."
cd backend
node mock-server.js &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Test backend
if curl -s http://localhost:8082/api/health > /dev/null; then
    echo "✅ Backend server responding"
else
    echo "❌ Backend server not responding"
fi

# Start frontend with Python (more reliable than serve)
echo "🌐 Starting frontend server on port 3001..."
cd ../frontend

if command -v python3 &> /dev/null; then
    echo "Using Python3 server..."
    python3 -m http.server 3001 --bind 0.0.0.0 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    echo "Using Python server..."
    python -m SimpleHTTPServer 3001 &
    FRONTEND_PID=$!
else
    echo "Using serve (without --host option)..."
    npx serve -s . -l 3001 &
    FRONTEND_PID=$!
fi

# Wait for frontend
sleep 3

# Test frontend
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend server responding"
else
    echo "❌ Frontend server not responding"
fi

echo
echo "🎉 Team Task Manager is ready!"
echo "📱 Share this link: http://192.168.1.100:3001"
echo "🔧 Backend API: http://192.168.1.100:8082"
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
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

trap cleanup INT
wait
