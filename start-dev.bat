@echo off
echo ========================================
echo   Starting Nala Pustaka Full Stack
echo ========================================
echo.
echo Starting Backend Server (Port 3001)...
start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Dev Server (Port 5173)...
start cmd /k "npm run dev"
echo.
echo ========================================
echo   Both servers started!
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo ========================================
