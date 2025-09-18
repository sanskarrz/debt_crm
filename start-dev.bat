@echo off
echo 🚀 Starting Debt Recovery CRM Development Environment...

echo 📦 Installing dependencies...
call npm run install:all

echo 🐳 Starting infrastructure services...
docker-compose up -d postgres redis asterisk

echo ⏳ Waiting for services to initialize...
timeout /t 15 /nobreak >nul

echo 🔧 Starting application services...
start "Backend API" cmd /k "cd backend && npm run start:dev"
timeout /t 5 /nobreak >nul

start "Dialer Service" cmd /k "cd dialer && npm run dev"
timeout /t 5 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ Development environment started!
echo.
echo 🌐 Access points:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo   Dialer Service: http://localhost:3002
echo   Asterisk ARI: http://localhost:8088
echo.
echo 👤 Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo Press any key to exit...
pause >nul

