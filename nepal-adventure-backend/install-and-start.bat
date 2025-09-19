@echo off
echo ===============================================
echo    Nepal Adventures Backend Setup
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo 📥 Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm is available
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Check if .env exists, if not copy from .env.example
if not exist .env (
    if exist .env.example (
        echo 📋 Copying .env.example to .env...
        copy .env.example .env
        echo ✅ .env file created
        echo ⚠️  Please update .env with your configuration
        echo.
    ) else (
        echo ⚠️  .env.example not found. Please create .env manually
        echo.
    )
) else (
    echo ✅ .env file exists
    echo.
)

echo ===============================================
echo    Starting Development Server
echo ===============================================
echo.
echo 🌟 API will be available at: http://localhost:5000
echo 🏥 Health check: http://localhost:5000/api/health
echo 📚 API Documentation: See README.md
echo.
echo 💡 Make sure MongoDB is running before using the API
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev

pause