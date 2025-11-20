@echo off
echo Starting Project Bolt...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

echo Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: Check the terminal for the port (usually 5173-5177)
echo.
echo Login with:
echo Email: tharun1616t@gmail.com
echo Password: password123
echo.
pause
