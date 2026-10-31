# OrderCraft Startup Script (PowerShell)
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   OrderCraft - Manufacturing OMS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "`nStarting Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; node server.js"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npx vite"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host " Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "`nDemo Credentials:" -ForegroundColor White
Write-Host "  Admin:    admin@ordercraft.com / Admin@123" -ForegroundColor Gray
Write-Host "  Employee: emp1@ordercraft.com  / Emp@123" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
