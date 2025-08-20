@echo off
REM install any necessary packages
start cmd /c ".\myenv\Scripts\pip3.exe install -r .\requirements.txt"

REM Wait for a few seconds to ensure packages are installed
timeout /t 5 /nobreak >nul

REM Start the backend server in a new terminal window
start cmd /k ".\myenv\Scripts\python.exe .\server_v4.py"

REM Wait for a few seconds to ensure the backend server starts
timeout /t 5 /nobreak >nul

REM Start the frontend server in a new terminal window
cd .\src
start cmd /k "npm run dev"

REM Wait for a few seconds to ensure the frontend server starts
timeout /t 5 /nobreak >nul

REM open the react website
start http://localhost:5173/