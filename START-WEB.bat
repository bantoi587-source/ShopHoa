@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo CHUA TIM THAY NODE.JS
  echo Cai Node.js LTS truoc, sau do chay lai file START-WEB.bat.
  echo.
  pause
  exit /b 1
)
start "" http://localhost:3000
node server.js
pause
