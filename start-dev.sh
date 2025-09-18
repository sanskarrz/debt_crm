#!/bin/bash

echo "🚀 Starting Debt Recovery CRM Development Environment..."

echo "📦 Installing dependencies..."
npm run install:all

echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis asterisk

echo "⏳ Waiting for services to initialize..."
sleep 15

echo "🔧 Starting application services..."

# Start backend in background
cd backend && npm run start:dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start dialer in background
cd ../dialer && npm run dev &
DIALER_PID=$!

# Wait a bit for dialer to start
sleep 5

# Start frontend in background
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo ""
echo "🌐 Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  Dialer Service: http://localhost:3002"
echo "  Asterisk ARI: http://localhost:8088"
echo ""
echo "👤 Default login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $DIALER_PID $FRONTEND_PID 2>/dev/null
    docker-compose down
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait

