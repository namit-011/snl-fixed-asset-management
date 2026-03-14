@echo off
setlocal EnableDelayedExpansion
title SNL Asset QR Viewer Server
color 1F
cls

echo.
echo  =====================================================
echo    SNL Fixed Asset Management
echo    Asset QR Viewer Server  ^|  Port 8080
echo  =====================================================
echo.

echo  [STEP 1] Finding your local IP address(es):
echo.
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /i "IPv4"') do (
    set RAW=%%A
    set RAW=!RAW: =!
    if not "!RAW!"=="" (
        echo           http://!RAW!:8080/asset-view.html
    )
)
echo.
echo  [STEP 2] Copy one URL above into the app:
echo           Login ^> Settings ^> Asset Viewer Base URL
echo           Then click Save Settings ^& reprint QR labels.
echo.
echo  [STEP 3] Server starting now...
echo.
echo  =====================================================
echo.

cd /d "%~dp0"

node server-node.js
if %errorlevel% neq 0 (
    echo  Node.js failed. Trying Python...
    python -m http.server 8080
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Neither Node.js nor Python found.
        echo  Please install Node.js from https://nodejs.org
        echo.
    )
)

echo.
echo  Server stopped.
pause
