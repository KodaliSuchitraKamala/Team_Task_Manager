#!/bin/bash

echo "Simple IP Fix - Basic Commands Only"
echo "=================================="

# Kill existing servers
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
pkill -f "python.*3000" 2>/dev/null || true
sleep 2

echo "Finding your IP address with basic commands..."

# Try different commands to find IP
REAL_IP=""

# Method 1: Try ifconfig (older systems)
if command -v ifconfig &> /dev/null; then
    REAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d':' -f2 | head -1)
fi

# Method 2: Try hostname -I
if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ]; then
    if command -v hostname &> /dev/null; then
        REAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
fi

# Method 3: Try /proc/net/route (very basic)
if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ]; then
    if [ -f /proc/net/route ]; then
        GATEWAY=$(awk '$2=="00000000" {print $1}' /proc/net/route | head -1)
        if [ -n "$GATEWAY" ]; then
            # Try to find interface with this gateway
            for interface in /sys/class/net/*/; do
                if [ -f "$interface/address" ]; then
                    INTERFACE=$(basename "$interface")
                    if [ -f "/sys/class/net/$INTERFACE/operstate" ] && [ "$(cat "/sys/class/net/$INTERFACE/operstate")" = "up" ]; then
                        # Try to get IP for this interface
                        if [ -f "/sys/class/net/$INTERFACE/inet" ]; then
                            REAL_IP=$(cat "/sys/class/net/$INTERFACE/inet" 2>/dev/null | head -1)
                        fi
                    fi
                fi
            done
        fi
    fi
fi

# Method 4: Manual check - show all possibilities
if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ]; then
    echo "❌ Could not auto-detect IP. Showing all available methods:"
    echo
    
    if command -v ifconfig &> /dev/null; then
        echo "ifconfig output:"
        ifconfig | grep 'inet ' | grep -v '127.0.0.1'
        echo
    fi
    
    if command -v hostname &> /dev/null; then
        echo "hostname -I output:"
        hostname -I 2>/dev/null
        echo
    fi
    
    if [ -f /proc/net/tcp ]; then
        echo "Active connections:"
        cat /proc/net/tcp | head -5
        echo
    fi
    
    echo "Please look at the output above and find your IP address."
    echo "Common IP patterns:"
    echo "  192.168.x.x (home network)"
    echo "  10.x.x.x (corporate network)"
    echo "  172.16-31.x.x (private network)"
    echo
    echo "Enter your IP address manually:"
    read -p "IP: " REAL_IP
fi

if [ -z "$REAL_IP" ] || [ "$REAL_IP" = "127.0.0.1" ]; then
    echo "❌ Still no valid IP found. Using localhost for testing only."
    REAL_IP="localhost"
fi

echo
echo "🌐 ACCESS LINK:"
echo "==============="
echo "http://$REAL_IP:3000"
echo "==============="
echo

# Start servers
echo "Starting servers..."
cd deployment

# Backend
cd backend
echo "Starting backend server..."
node mock-server.js &
BACKEND_PID=$!

sleep 3

# Frontend - try multiple methods
cd ../frontend/build
echo "Starting frontend server..."

if command -v python3 &> /dev/null; then
    echo "Using Python3 server..."
    python3 -m http.server 3000 --bind 0.0.0.0 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    echo "Using Python server..."
    python -m SimpleHTTPServer 3000 &
    FRONTEND_PID=$!
else
    echo "❌ No Python found. Trying serve..."
    if command -v serve &> /dev/null; then
        serve -s . -l 3000 --host 0.0.0.0 &
        FRONTEND_PID=$!
    else
        echo "❌ No suitable server found"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

echo
echo "✅ Servers started!"
echo "🌐 Share this URL: http://$REAL_IP:3000"
echo "📱 Other laptops should access: http://$REAL_IP:3000"
echo
echo "⏹️  Press Ctrl+C to stop servers"

# Cleanup function
cleanup() {
    echo
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

trap cleanup INT
wait
