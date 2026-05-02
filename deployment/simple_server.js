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
