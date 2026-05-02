#!/bin/bash

echo "Network Connectivity Fix"
echo "======================"

# Your IP address
IP="192.168.1.100"

echo "Testing network connectivity for IP: $IP"
echo

# Step 1: Test basic connectivity
echo "Step 1: Testing basic network connectivity..."
echo "Testing ping to $IP..."
if ping -c 3 $IP > /dev/null 2>&1; then
    echo "✅ Ping to $IP successful"
else
    echo "❌ Ping to $IP failed - this is the main problem!"
    echo "   Your computer cannot reach itself via this IP"
    echo "   This suggests a network configuration issue"
    echo
    echo "Possible solutions:"
    echo "1. Try using localhost instead (for testing only)"
    echo "2. Check your network interface configuration"
    echo "3. Check firewall settings"
    echo
    IP="localhost"
    echo "Switching to localhost for testing: $IP"
fi

echo

# Step 2: Check what's actually running
echo "Step 2: Checking running processes..."
echo "Processes using port 3001:"
netstat -tlnp 2>/dev/null | grep ":3001" || echo "  Nothing running on port 3001"

echo "Processes using port 8082:"
netstat -tlnp 2>/dev/null | grep ":8082" || echo "  Nothing running on port 8082"

echo

# Step 3: Kill everything and start simple
echo "Step 3: Clean restart with simple server..."
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "node.*8082" 2>/dev/null || true
pkill -f "serve.*3001" 2>/dev/null || true
sleep 2

# Step 4: Create a simple test server
echo "Step 4: Creating simple test server..."
cd deployment

# Create a simple HTML test page
cat > test_index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Team Task Manager - Test</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .success { color: green; font-size: 24px; }
        .info { color: blue; margin: 20px; }
    </style>
</head>
<body>
    <h1 class="success">✅ Team Task Manager is Working!</h1>
    <div class="info">
        <p>If you can see this page, the server is working correctly.</p>
        <p>Other laptops should be able to access this same page.</p>
        <p>Time: <span id="time"></span></p>
    </div>
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
EOF

# Create simple server script
cat > simple_server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;
const host = '0.0.0.0';

const server = http.createServer((req, res) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Serve the test page
    if (req.url === '/' || req.url === '/index.html') {
        try {
            const html = fs.readFileSync('test_index.html', 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

server.listen(port, host, () => {
    console.log(`Simple server running at http://${host}:${port}`);
    console.log(`Access at: http://192.168.1.100:${port}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
EOF

echo "Starting simple test server..."
node simple_server.js &
SERVER_PID=$!

sleep 3

# Step 5: Test the server locally
echo "Step 5: Testing server locally..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server responding locally"
else
    echo "❌ Server not responding locally"
fi

echo
echo "🌐 TEST RESULTS:"
echo "==============="
echo "Local test: http://localhost:3001"
echo "Network test: http://$IP:3001"
echo
echo "📱 INSTRUCTIONS FOR OTHER LAPTOPS:"
echo "=================================="
echo "1. From other laptop, try: http://192.168.1.100:3001"
echo "2. If it says 'took too long to respond':"
echo "   - Check both laptops are on same WiFi/network"
echo "   - Try pinging 192.168.1.100 from other laptop"
echo "   - Check firewall settings on your computer"
echo "3. If you see the test page, the network is working!"
echo

# Cleanup function
cleanup() {
    echo
    echo "Stopping test server..."
    kill $SERVER_PID 2>/dev/null
    echo "Server stopped."
    exit 0
}

trap cleanup INT

echo "⏹️  Press Ctrl+C to stop test server"
echo "🌐 Test page: http://$IP:3001"
echo

wait
