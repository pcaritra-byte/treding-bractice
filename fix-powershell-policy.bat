@echo off
title Fix PowerShell Script Execution Policy
cd /d "%~dp0"

echo =====================================================================
echo    Fix PowerShell Policy for NPM / Node.js
echo =====================================================================
echo.
echo This script fixes the error:
echo "File ... npm.ps1 cannot be loaded because running scripts is disabled"
echo.
echo Updating PowerShell ExecutionPolicy for CurrentUser to RemoteSigned...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; Write-Host 'SUCCESS: PowerShell script execution enabled for current user!' -ForegroundColor Green"

echo.
echo =====================================================================
echo Done! You can now run 'npm run dev' inside VS Code or PowerShell.
echo =====================================================================
echo.
pause
