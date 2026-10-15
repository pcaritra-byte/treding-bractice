@echo off
title ChartPilot Dev Server
cd /d "%~dp0"

echo ===================================================
echo           ChartPilot - Starting Dev Server
echo ===================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js (version 20 or higher) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
)

echo [INFO] Starting Next.js development server...
echo [INFO] Your app will be live at: http://localhost:3000
echo.
echo Press Ctrl+C in this window anytime to stop the server.
echo.

:: Launch browser in background after short delay
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

:: Run Next.js dev server
call npm.cmd run dev

if %errorlevel% neq 0 (
    echo.
    echo [INFO] Server stopped or encountered an issue.
    pause
)
