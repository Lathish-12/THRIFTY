@echo off
title THRIFTY - FIX AND RESET

echo ==========================================
echo    THRIFTY - REPAIRING AND STARTING
echo ==========================================
echo.

:: Kill existing processes to ensure fresh start
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

echo [1/3] Updating Backend...
cd /d "%~dp0backend"
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe manage.py migrate

echo.
echo [2/3] Updating Frontend...
cd /d "%~dp0"
call npm install

echo.
echo [3/3] Starting Servers...
cd /d "%~dp0backend"
start "Backend" cmd /c ".venv\Scripts\python.exe manage.py runserver 8000"
cd /d "%~dp0"
start "Frontend" cmd /c "npm run dev"

echo.
echo ⏳ Waiting for servers (10 seconds)...
timeout /t 10 /nobreak > nul

echo.
echo 🚀 Opening http://localhost:5173
start http://localhost:5173

echo.
echo ALL FIXED! Project is running.
pause
