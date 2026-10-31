@echo off
echo ============================================
echo    OrderCraft - Manufacturing OMS
echo ============================================
echo.
echo Starting Backend Server (Port 5000)...
start "OrderCraft Backend" cmd /k "cd /d %~dp0backend && node server.js"

echo Waiting 2 seconds for backend to start...
timeout /t 2 /nobreak >nul

echo Starting Frontend Dev Server (Port 5173)...
start "OrderCraft Frontend" cmd /k "cd /d %~dp0frontend && npx vite"

echo.
echo ============================================
echo  Servers starting...
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ============================================
echo.
echo Demo Credentials:
echo   Admin:    admin@ordercraft.com / Admin@123
echo   Employee: emp1@ordercraft.com  / Emp@123
echo ============================================
pause
