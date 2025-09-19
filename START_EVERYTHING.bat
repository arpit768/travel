@echo off
title Nepal Adventures - Complete Setup
color 0A

echo.
echo ===============================================
echo       NEPAL ADVENTURES PLATFORM
echo           Complete Setup Script
echo ===============================================
echo.

echo 🚀 Starting Nepal Adventures Platform...
echo.

REM Check Node.js
echo 📋 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first:
    echo 📥 https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check MongoDB
echo 📋 Checking MongoDB connection...
echo ⚠️  Make sure MongoDB is running before proceeding!
echo.

REM Navigate to backend directory
echo 📂 Setting up backend...
cd nepal-adventure-backend

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Check .env file
if not exist .env (
    echo 📋 Creating .env file...
    copy .env.example .env >nul 2>&1
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo ===============================================
echo           STARTING SERVICES
echo ===============================================
echo.

echo 🌟 Starting backend server on port 5000...
echo 📍 API: http://localhost:5000
echo 🏥 Health: http://localhost:5000/api/health
echo.
echo 🌐 Frontend: Open nepal-adventure-website/index.html in browser
echo 📝 Test page: Open nepal-adventure-website/test.html
echo.
echo 💡 IMPORTANT NOTES:
echo    - Make sure MongoDB is running
echo    - Backend must be running for frontend to work
echo    - Use Ctrl+C to stop the backend server
echo.
echo ===============================================

REM Start the backend server
echo 🚀 Starting backend server...
echo.
npm run dev

echo.
echo Backend server stopped.
pause