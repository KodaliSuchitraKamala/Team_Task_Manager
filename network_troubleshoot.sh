#!/bin/bash

echo "Network Troubleshooting for Team Task Manager"
echo "=========================================="
echo

echo "🔍 STEP 1: Network Diagnosis"
echo "==========================="

# Get IP address
IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7}' | head -1)
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1 | cut -d':' -f2)
fi

echo "Your IP address: $IP"
echo

# Check if servers are running
echo "🔍 STEP 2: Server Status Check"
echo "=============================="

if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "✅ Frontend server is running on port 3000"
else
    echo "❌ Frontend server is NOT running on port 3000"
fi

if netstat -tlnp 2>/dev/null | grep -q ":8081"; then
    echo "✅ Backend server is running on port 8081"
else
    echo "❌ Backend server is NOT running on port 8081"
fi

echo

echo "🔍 STEP 3: Firewall Check"
echo "========================"

# Check if firewall is blocking
if command -v ufw &> /dev/null; then
    echo "UFW Firewall Status:"
    ufw status | grep -E "(Status|3000|8081)"
fi

if command -v firewall-cmd &> /dev/null; then
    echo "Firewall-cmd Status:"
    firewall-cmd --list-all 2>/dev/null | grep -E "(ports|3000|8081)"
fi

echo

echo "🔍 STEP 4: Network Interface Check"
echo "================================="

echo "Active network interfaces:"
ip addr show | grep -E "^[0-9]+:" | awk -F': ' '{print $2}' | while read interface; do
    echo "  $interface:"
    ip addr show "$interface" | grep "inet " | grep -v "127.0.0.1" | awk '{print "    " $2}'
done

echo

echo "🔍 STEP 5: Port Accessibility Test"
echo "================================="

echo "Testing if ports are accessible from this machine..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend accessible locally"
else
    echo "❌ Frontend NOT accessible locally"
fi

if curl -s http://localhost:8081/api/health > /dev/null; then
    echo "✅ Backend accessible locally"
else
    echo "❌ Backend NOT accessible locally"
fi

echo

echo "🔧 STEP 6: Creating Solution"
echo "=========================="

# Kill existing processes
echo "Stopping existing servers..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Try different approach - use simple HTTP server for frontend
echo "Starting servers with alternative configuration..."

# Start backend
cd deployment/backend
node mock-server.js &
BACKEND_PID=$!

sleep 3

# Start frontend with python if available, else use serve
cd ../frontend
if command -v python3 &> /dev/null; then
    echo "Using Python3 server for frontend..."
    cd build
    python3 -m http.server 3000 --bind 0.0.0.0 &
    FRONTEND_PID=$!
    cd ..
elif command -v python &> /dev/null; then
    echo "Using Python server for frontend..."
    cd build
    python -m SimpleHTTPServer 3000 &
    FRONTEND_PID=$!
    cd ..
else
    echo "Using serve for frontend..."
    if command -v serve &> /dev/null; then
        serve -s build -l 3000 --host 0.0.0.0 &
        FRONTEND_PID=$!
    else
        echo "❌ No suitable frontend server found"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

echo
echo "🌐 ACCESS INFORMATION"
echo "===================="
echo "Your IP: $IP"
echo "Frontend: http://$IP:3000"
echo "Backend:  http://$IP:8081"
echo

echo "📱 TESTING INSTRUCTIONS"
echo "======================"
echo "1. From your computer: http://localhost:3000"
echo "2. From other laptops: http://$IP:3000"
echo "3. If other laptops can't access:"
echo "   - Check they are on the same WiFi/network"
echo "   - Try: http://$IP:3000 in their browser"
echo "   - Check firewall settings on your computer"
echo

echo "🔍 TROUBLESHOOTING COMMANDS FOR OTHER LAPTOPS"
echo "============================================"
echo "From other laptops, run these commands:"
echo "  ping $IP"
echo "  telnet $IP 3000"
echo "  curl http://$IP:3000"
echo

echo "🔧 FIREWALL FIX COMMANDS"
echo "========================"
echo "If needed, run these commands on your computer:"
echo "  sudo ufw allow 3000"
echo "  sudo ufw allow 8081"
echo "  sudo ufw reload"
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
