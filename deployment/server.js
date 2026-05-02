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
