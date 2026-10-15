@echo off
title ChartPilot Build Test
cd /d "%~dp0"

echo ===================================================
echo           ChartPilot - Production Build
echo ===================================================
echo.

call npm.cmd run build

echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Project compiled and built successfully!
) else (
    echo [ERROR] Build failed. Please check the logs above.
)
echo.
pause
