@echo off
echo 🚀 Starting Roomly Hotel Management System...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ Error: .env file not found!
    echo Please copy .env.example to .env and configure your database settings.
    pause
    exit /b 1
)

REM Start the application
echo 🌟 Starting server...
echo Open your browser and go to: http://localhost:3000
echo.
npm start
