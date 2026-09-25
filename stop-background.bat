@echo off
echo Stopping IT Helpdesk Server...
taskkill /F /IM node.exe >nul 2>&1
echo Server Stopped Successfully!
pause
