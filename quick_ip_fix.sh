#!/bin/bash

echo "Quick IP Fix - Finding Real Network IP"
echo "===================================="

# Kill any existing servers first
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "python.*3000" 2>/dev/null || true
sleep 2

echo "Finding your REAL IP address..."

# Try multiple methods to get the REAL IP (not localhost or fallback)
REAL_IP=""

# Method 1: Get the IP used for internet connection
REAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -1)

# Method 2: Get primary interface IP
if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ] || [ "$REAL_IP" = "10.0.0.1" ]; then
    REAL_IP=$(ip addr show 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | grep -v '10.0.0.1' | awk '{print $2}' | cut -d'/' -f1 | head -1)
fi

# Method 3: Check all interfaces for real IPs
if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ] || [ "$REAL_IP" = "10.0.0.1" ]; then
    REAL_IP=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -v '127.0.0.1' | grep -v '10.0.0.1' | head -1)
fi

# Method 4: Use ifconfig as last resort
if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ] || [ "$REAL_IP" = "10.0.0.1" ]; then
    REAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | grep -v '10.0.0.1' | awk '{print $2}' | cut -d':' -f2 | head -1)
fi

echo "Your REAL IP address: $REAL_IP"

if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ] || [ "$REAL_IP" = "10.0.0.1" ]; then
    echo "❌ Could not find real IP. Showing all available IPs:"
    ip addr show | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1
    echo "Please manually check which IP is your network IP above."
    exit 1
fi

echo
echo "🌐 CORRECT ACCESS LINK:"
echo "======================"
echo "http://$REAL_IP:3000"
echo "======================"
echo

# Start servers with simple configuration
echo "Starting servers with IP: $REAL_IP"

cd deployment

# Use Python for frontend (more reliable)
cd frontend/build
if command -v python3 &> /dev/null; then
    echo "Starting frontend with Python3..."
    python3 -m http.server 3000 --bind 0.0.0.0 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    echo "Starting frontend with Python..."
    python -m SimpleHTTPServer 3000 &
    FRONTEND_PID=$!
else
    echo "❌ Python not found. Trying serve..."
    serve -s . -l 3000 --host 0.0.0.0 &
    FRONTEND_PID=$!
fi

# Start backend
cd ../../backend
echo "Starting backend..."
node mock-server.js &
BACKEND_PID=$!

echo
echo "✅ Servers started!"
echo "🌐 Share this URL: http://$REAL_IP:3000"
echo "📱 Test from other laptop: http://$REAL_IP:3000"
echo
echo "⏹️  Press Ctrl+C to stop servers"

# Cleanup function
cleanup() {
    echo
    echo "Stopping servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

trap cleanup INT
wait
