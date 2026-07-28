Write-Host ""
Write-Host "=========================================================" -ForegroundColor Red
Write-Host "   LifeFlow Blood Bank Management System - Setup Script  " -ForegroundColor Red
Write-Host "=========================================================" -ForegroundColor Red
Write-Host ""

# Check Node.js installation
Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Cyan
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Node.js is NOT installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js LTS from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installing Node.js, re-run this script." -ForegroundColor Yellow
    Write-Host ""
    Start-Process "https://nodejs.org/"
    exit 1
} else {
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
}

# Check npm
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm is NOT available. Please reinstall Node.js." -ForegroundColor Red
    exit 1
} else {
    Write-Host "[OK] npm found: v$npmVersion" -ForegroundColor Green
}

# Install Server Dependencies
Write-Host ""
Write-Host "[2/4] Installing Backend (server) dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\server"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install server dependencies." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Server dependencies installed." -ForegroundColor Green

# Install Client Dependencies
Write-Host ""
Write-Host "[3/4] Installing Frontend (client) dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\client"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install client dependencies." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Client dependencies installed." -ForegroundColor Green

# Seed Database
Write-Host ""
Write-Host "[4/4] Seeding MongoDB database with initial demo data..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\server"
node seed/seed.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Database seeding failed. Make sure MongoDB is running." -ForegroundColor Yellow
    Write-Host "  - For local MongoDB: Run 'net start MongoDB' as Administrator" -ForegroundColor Yellow
    Write-Host "  - Or update MONGODB_URI in server/.env with your Atlas URI" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Database seeded with demo data for all 5 roles." -ForegroundColor Green
}

# Final Instructions
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "   Setup Complete! Follow these steps to start the app:  " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  TERMINAL 1 (Backend API - Port 5000):" -ForegroundColor Yellow
Write-Host "    cd `"$(Split-Path $PSScriptRoot)\server`"" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  TERMINAL 2 (Frontend React - Port 5173):" -ForegroundColor Yellow
Write-Host "    cd `"$(Split-Path $PSScriptRoot)\client`"" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  Then open: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo Login Accounts:" -ForegroundColor Yellow
Write-Host "    Super Admin  : superadmin@bloodbank.com / Admin@123" -ForegroundColor White
Write-Host "    Admin        : admin@bloodbank.com / Admin@123" -ForegroundColor White
Write-Host "    Staff        : staff@bloodbank.com / Staff@123" -ForegroundColor White
Write-Host "    Hospital     : cityhospital@hospital.com / Hospital@123" -ForegroundColor White
Write-Host "    Donor        : john.doe@donor.com / Donor@123" -ForegroundColor White
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green

Set-Location $PSScriptRoot
