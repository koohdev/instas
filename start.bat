@echo off
title InstaScrape Studio
cd /d "%~dp0"

echo.
echo  ======================================================
echo  ✦  INSTASCRAPE STUDIO - MULTI-DEVICE LOCAL SERVER
echo  ======================================================
echo.

:: Get Local IPv4 Address using .NET DNS API
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "[System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object AddressFamily -eq 'InterNetwork' | Select-Object -ExpandProperty IPAddressToString | Select-Object -Last 1"') do (
    set LOCAL_IP=%%a
)

:: Kill any orphan node processes on port 3000
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%p > nul 2>&1
)

echo  [Desktop PC]   http://localhost:3000
if defined LOCAL_IP (
    echo  [Mobile/WiFi]  http://%LOCAL_IP%:3000
    echo.
    echo  ------------------------------------------------------
    echo  HOW TO VIEW ON YOUR PHONE / TABLET:
    echo  1. Connect your phone to the SAME Wi-Fi network.
    echo  2. Open Safari or Chrome on your phone.
    echo  3. Go to: http://%LOCAL_IP%:3000
    echo  ------------------------------------------------------
)
echo.
echo  Starting local Next.js server (0.0.0.0:3000)...
echo.

:: Open browser automatically after 3 seconds in background
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

:: Run Next.js server live in this window
npm run dev
