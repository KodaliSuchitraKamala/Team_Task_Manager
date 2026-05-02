#!/bin/bash

echo "Getting Access Link for Other Laptops"
echo "===================================="

# Kill existing processes first
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Find IP address
IP=$(ip route get 8.8.8.8 2>/dev/null | awk '{print $7}' | head -1)
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1 | cut -d':' -f2)
fi
if [ -z "$IP" ] || [ "$IP" = "127.0.0.1" ]; then
    IP="10.0.0.1"
fi

echo
echo "🌐 ACCESS LINK FOR OTHER LAPTOPS:"
echo "================================"
echo "http://$IP:3000"
echo "================================"
echo
echo "Share this link with other users on your network"
echo

# Start servers automatically
echo "Starting servers..."
cd deployment

# Backend
cd backend
node mock-server.js &
sleep 3

# Frontend
cd ../frontend
if command -v serve &> /dev/null; then
    serve -s build -l 3000 &
else
    node ../../node_modules/serve/bin/serve.js -s build -l 3000 &
fi

echo "✅ Servers started!"
echo "📱 Other laptops can now access: http://$IP:3000"
