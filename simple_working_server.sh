#!/bin/bash

echo "Simple Working Server"
echo "==================="

# Kill any existing processes
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "python.*3001" 2>/dev/null || true
sleep 2

echo "Starting a simple HTTP server..."

# Try different server methods
cd deployment

# Method 1: Try Python3 first
if command -v python3 &> /dev/null; then
    echo "Using Python3 HTTP server..."
    mkdir -p simple_test
    cd simple_test
    
    # Create simple HTML page
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Team Task Manager - Working!</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 36px; margin-bottom: 20px; }
        .success { color: #4CAF50; font-size: 48px; margin: 20px 0; }
        .info { font-size: 18px; margin: 15px 0; }
        .time { font-size: 24px; font-weight: bold; }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Team Task Manager</h1>
        <div class="success">✅ SERVER IS WORKING!</div>
        <div class="info">
            <p>If you can see this page, the server is running correctly.</p>
            <p>Other laptops can access this application.</p>
            <p>Current time: <span class="time" id="time"></span></p>
        </div>
        <button onclick="testConnection()">Test Connection</button>
        <button onclick="showInfo()">Show Info</button>
        <div id="result" style="margin-top: 20px; font-size: 18px;"></div>
    </div>
    
    <script>
        function updateTime() {
            document.getElementById('time').textContent = new Date().toLocaleString();
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        function testConnection() {
            fetch('/api/test')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('result').innerHTML = 
                        '<span style="color: #4CAF50;">✅ Connection test successful!</span>';
                })
                .catch(error => {
                    document.getElementById('result').innerHTML = 
                        '<span style="color: #ff9800;">⚠️ API not available, but server is working</span>';
                });
        }
        
        function showInfo() {
            document.getElementById('result').innerHTML = 
                '<div style="text-align: left;">' +
                '<strong>Server Info:</strong><br>' +
                '• Server: Python3 HTTP Server<br>' +
                '• Port: 3001<br>' +
                '• IP: 192.168.1.100<br>' +
                '• Status: Working ✅<br>' +
                '<br><strong>For other laptops:</strong><br>' +
                'Access: http://192.168.1.100:3001<br>' +
                '</div>';
        }
        
        // Auto-test connection
        setTimeout(testConnection, 1000);
    </script>
</body>
</html>
EOF
    
    # Start Python3 server
    python3 -m http.server 3001 --bind 0.0.0.0 &
    SERVER_PID=$!
    
    echo "✅ Python3 server started!"
    echo "🌐 Local access: http://localhost:3001"
    echo "🌐 Network access: http://192.168.1.100:3001"
    echo
    echo "📱 Share this URL with other laptops: http://192.168.1.100:3001"
    echo "⏹️  Press Ctrl+C to stop server"
    echo
    
    # Wait for server to start
    sleep 2
    
    # Test if server is responding
    if curl -s http://localhost:3001 > /dev/null; then
        echo "✅ Server is responding locally!"
    else
        echo "❌ Server not responding locally"
    fi
    
    # Cleanup function
    cleanup() {
        echo
        echo "🛑 Stopping Python3 server..."
        kill $SERVER_PID 2>/dev/null
        echo "✅ Server stopped."
        exit 0
    }
    
    trap cleanup INT
    wait
    
else
    # Method 2: Try Python2
    if command -v python &> /dev/null; then
        echo "Using Python2 HTTP server..."
        mkdir -p simple_test
        cd simple_test
        
        cat > index.html << 'EOF'
<!DOCTYPE html>
<html><head><title>Team Task Manager</title></head>
<body>
<h1>✅ Team Task Manager Server Working!</h1>
<p>Access from other laptops: http://192.168.1.100:3001</p>
<p>Time: <script>document.write(new Date())</script></p>
</body></html>
EOF
        
        python -m SimpleHTTPServer 3001 &
        SERVER_PID=$!
        
        echo "✅ Python2 server started!"
        echo "🌐 Access: http://192.168.1.100:3001"
        
        cleanup() {
            kill $SERVER_PID 2>/dev/null
            exit 0
        }
        
        trap cleanup INT
        wait
        
    else
        # Method 3: Try Node.js simple server
        echo "Python not found. Creating Node.js server..."
        
        cat > server.js << 'EOF'
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
<!DOCTYPE html>
<html>
<head><title>Team Task Manager</title></head>
<body>
<h1>✅ Team Task Manager Server Working!</h1>
<p>Access from other laptops: http://192.168.1.100:3001</p>
<p>Time: ${new Date()}</p>
</body>
</html>
    `);
});

server.listen(3001, '0.0.0.0', () => {
    console.log('Server running at http://192.168.1.100:3001');
});

process.on('SIGINT', () => {
    console.log('\\nStopping server...');
    process.exit(0);
});
EOF
        
        node server.js &
        SERVER_PID=$!
        
        echo "✅ Node.js server started!"
        echo "🌐 Access: http://192.168.1.100:3001"
        
        cleanup() {
            kill $SERVER_PID 2>/dev/null
            exit 0
        }
        
        trap cleanup INT
        wait
    fi
fi
