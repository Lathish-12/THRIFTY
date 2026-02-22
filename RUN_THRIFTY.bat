@echo off
:: This script starts the Thrifty project
:: If the window closes instantly, please right-click and 'Run as Administrator'

title THRIFTY STARTUP
echo ==========================================
echo    THRIFTY - PROJECT STARTING...
echo ==========================================
echo.

:: 1. Move to backend and start Django
echo [1/2] Launching Backend Server...
cd /d "%~dp0backend"
start "THRIFTY-BACKEND" cmd /c ".venv\Scripts\python.exe manage.py runserver 8000"

:: 2. Back to root and start Vite
echo [2/2] Launching Frontend Server...
cd /d "%~dp0"
start "THRIFTY-FRONTEND" cmd /c "npm run dev"

echo.
echo ⏳ Waiting for servers to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo 🚀 Opening Website: http://localhost:5173
start http://localhost:5173

echo.
echo ==========================================
echo    SUCCESS! Project is running.
echo ==========================================
echo Keep this window open. To stop, close all 3 windows.
echo.
pause
