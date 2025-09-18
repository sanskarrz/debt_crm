@echo off
echo 🚀 Setting up Debt Recovery CRM...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

REM Copy environment files
echo ⚙️ Setting up environment files...
copy backend\env.example backend\.env
copy dialer\env.example dialer\.env

echo 🐳 Starting infrastructure services...
docker-compose up -d postgres redis asterisk

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo 🔧 Running database migrations...
REM Database will be automatically initialized via init.sql

echo ✅ Setup complete!
echo.
echo 🎉 Debt Recovery CRM is ready!
echo.
echo To start the application:
echo   npm run dev
echo.
echo Access points:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo   Dialer Service: http://localhost:3002
echo   Asterisk ARI: http://localhost:8088
echo.
echo Default admin credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo ⚠️  Remember to:
echo   1. Update SIP trunk credentials in asterisk\config\sip.conf
echo   2. Configure GSM gateway settings
echo   3. Change default passwords in production

