@echo off
title FleetFlow Server
color 0A
echo.
echo =========================================
echo    FLEETFLOW - Starting Backend Server
echo =========================================
echo.

cd /d "%~dp0backend"

:: Check if node_modules exist
IF NOT EXIST "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting FleetFlow on http://localhost:5000
echo.
echo  - App:  http://localhost:5000
echo  - API:  http://localhost:5000/api
echo.
echo Press Ctrl+C to stop.
echo.

node server.js

pause
