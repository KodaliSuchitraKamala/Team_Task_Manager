#!/bin/bash

echo "Team Task Manager - Production Build and Deploy"
echo "=============================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "1. Creating production build..."
cd frontend
if ! npm run build; then
    echo "Build failed! Check for errors above."
    exit 1
fi

echo
echo "2. Creating deployment directory..."
cd ..
mkdir -p deployment/dist/frontend
mkdir -p deployment/dist/backend

echo
echo "3. Copying build files..."
cp -r frontend/build/* deployment/dist/frontend/

echo
echo "4. Copying backend files..."
cp mock-server.js deployment/dist/backend/
if [ -d "data" ]; then
    cp -r data/* deployment/dist/backend/data/
fi

echo
echo "5. Creating production server configuration..."
cd deployment
cat > package.json << 'EOF'
{
  "name": "team-task-manager-production",
  "version": "1.0.0",
  "description": "Production deployment of Team Task Manager",
  "main": "production_server.js",
  "scripts": {
    "start": "node production_server.js",
    "install-deps": "npm install express cors",
    "setup": "npm run install-deps && echo 'Setup complete!'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

echo
echo "6. Installing dependencies..."
npm install

echo
echo "7. Creating startup script..."
cat > start_production.sh << 'EOF'
#!/bin/bash

echo "Starting Team Task Manager Production Server..."
echo
echo "Frontend: http://10.65.65.179:3000"
echo "Backend:  http://10.65.65.179:8081"
echo
echo "Both servers are starting..."
echo "Frontend will be available at: http://10.65.65.179:3000"
echo "Backend API at: http://10.65.65.179:8081"
echo

# Start backend server
cd backend
node mock-server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
cd ../frontend
npx serve -s build -l 3000 &
FRONTEND_PID=$!

echo
echo "Servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start_production.sh

echo
echo "8. Creating README for deployment..."
cat > README.md << 'EOF'
# Team Task Manager - Production Deployment

## Quick Start
1. Run: ./start_production.sh
2. Open browser: http://10.65.65.179:3000

## Default Login
- Admin: Suchitra Kamala / Suchitra1325
- Member: Register new account

## Access URLs
- Frontend: http://10.65.65.179:3000
- Backend API: http://10.65.65.179:8081

## Stop Servers
Press Ctrl+C in the terminal where servers are running
EOF

echo
echo "=============================================="
echo "Build completed successfully!"
echo
echo "Deployment files are in: deployment/dist/"
echo
echo "To start the production server:"
echo "  1. Go to deployment directory"
echo "  2. Run: ./start_production.sh"
echo "  3. Access: http://10.65.65.179:3000"
echo

# Make scripts executable
chmod +x start_production.sh
chmod +x build_and_deploy.sh

echo "Scripts are now executable. Ready to deploy!"
