#!/bin/bash

echo "🚀 Setting up Debt Recovery CRM..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Copy environment files
echo "⚙️ Setting up environment files..."
cp backend/env.example backend/.env
cp dialer/env.example dialer/.env

echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis asterisk

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔧 Running database migrations..."
# Database will be automatically initialized via init.sql

echo "✅ Setup complete!"
echo ""
echo "🎉 Debt Recovery CRM is ready!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  Dialer Service: http://localhost:3002"
echo "  Asterisk ARI: http://localhost:8088"
echo ""
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  Remember to:"
echo "  1. Update SIP trunk credentials in asterisk/config/sip.conf"
echo "  2. Configure GSM gateway settings"
echo "  3. Change default passwords in production"

