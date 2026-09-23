@echo off
cd /d "%~dp0"
echo =======================================
echo     Starting SkillSync Dashboard
echo =======================================
echo.

echo [1/2] Starting FastAPI Backend on Port 8000...
start "SkillSync Backend" cmd /k "cd /d ""%~dp0backend"" && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting React + Vite Frontend on Port 5173...
start "SkillSync Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo.
echo Both servers have been launched in separate command windows!
echo - Frontend Website: http://localhost:5173
echo - Backend API Docs: http://localhost:8000/docs
echo.
pause
