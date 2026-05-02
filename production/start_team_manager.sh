#!/bin/bash

echo "🚀 Starting Team Task Manager"
echo "=========================="
echo "🌐 IP: 192.168.1.100"
echo "🔧 Backend: http://192.168.1.100:8081"
echo "🌐 Frontend: http://192.168.1.100:3000"
echo

# Kill any existing processes
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Start backend server
echo "🔧 Starting backend server..."
cd backend
node mock-server.js &
BACKEND_PID=$!

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
FRONTEND_PID=$!

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
echo "📱 Share this link: http://192.168.1.100:3000"
echo "🔧 API endpoint: http://192.168.1.100:8081"
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
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

trap cleanup INT
wait
