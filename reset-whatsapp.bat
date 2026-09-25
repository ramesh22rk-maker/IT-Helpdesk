@echo off
title Reset & Connect WhatsApp QR Code
cd /d "%~dp0"
echo =============================================================
echo   📱 RESETTING WHATSAPP SESSION TO GENERATE FRESH QR CODE
echo =============================================================
echo.
echo Stopping existing server processes...
taskkill /F /IM node.exe >nul 2>&1

echo Clearing previous WhatsApp auth session...
if exist ".wwebjs_auth" rmdir /s /q ".wwebjs_auth"

echo.
echo Starting IT Helpdesk Server... Scan the QR code below on your phone!
echo.
node server.js
pause
