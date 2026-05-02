#!/bin/bash

echo "Quick Deploy - Team Task Manager"
echo "==============================="

# Kill existing processes
echo "Stopping existing servers..."
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "serve.*3000" 2>/dev/null || true
sleep 2

# Get IP
IP=$(hostname -I | awk '{print $1}')
echo "Your IP: $IP"

# Build frontend
echo "Building frontend..."
cd frontend
npm run build

# Setup deployment
cd ..
mkdir -p deployment/dist/frontend deployment/dist/backend
cp -r frontend/build/* deployment/dist/frontend/
cp mock-server.js deployment/dist/backend/
if [ -d "data" ]; then
    cp -r data/* deployment/dist/backend/data/
fi

# Create package.json for deployment
cd deployment
cat > package.json << 'EOF'
{
  "name": "team-task-manager-production",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

npm install

# Create simple startup script
cat > start.sh << EOF
#!/bin/bash
echo "Starting servers..."
IP=\$(hostname -I | awk '{print \$1}')
echo "Access: http://\$IP:3000"

# Backend
cd backend && node mock-server.js &
sleep 3

# Frontend  
cd ../frontend && serve -s build -l 3000 &
wait
EOF

chmod +x start.sh

echo "Deployment ready!"
echo "Run: cd deployment && ./start.sh"
echo "Access: http://$IP:3000"
