@echo off
echo 🎯 Setting up Debt Recovery CRM with Admin Panel...

echo 📦 Installing dependencies...
call npm run install:all

echo ⚙️ Setting up environment files...
copy backend\env.example backend\.env
copy dialer\env.example dialer\.env

echo 🐳 Starting infrastructure services...
docker-compose up -d postgres redis asterisk

echo ⏳ Waiting for services to initialize...
timeout /t 15

echo 🔧 Starting application services...
start "Backend API" cmd /k "cd backend && npm run start:dev"
timeout /t 5

start "Dialer Service" cmd /k "cd dialer && npm run dev"
timeout /t 5

start "Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ Setup complete!
echo.
echo 🎉 Debt Recovery CRM with Admin Panel is ready!
echo.
echo 🌐 Access points:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo   Dialer Service: http://localhost:3002
echo   Asterisk ARI: http://localhost:8088
echo.
echo 👤 Admin Login:
echo   Username: admin
echo   Password: admin123
echo.
echo 📋 Next Steps:
echo   1. Login as admin
echo   2. Configure SIP trunk in Admin Panel
echo   3. Setup GSM gateway
echo   4. Create supervisors and agents
echo   5. Start your first campaign!
echo.
echo 📖 See ADMIN_SETUP_GUIDE.md for detailed instructions
echo.
echo Press any key to exit...
pause >nul

