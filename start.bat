@echo off
setlocal
chcp 65001 >nul
title mk_photo_mask V3.5 - Local Offline Server
cd /d "%~dp0"

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Windows PowerShell not found.
  echo Please run on Windows 10/11 with Windows PowerShell available.
  pause
  exit /b 1
)

if not exist "%~dp0server.ps1" (
  echo [ERROR] server.ps1 not found.
  echo Please extract the complete mk_photo_mask V3.5 package again.
  pause
  exit /b 1
)

if not exist "%~dp0index.html" (
  echo [ERROR] index.html not found.
  echo Please extract the complete mk_photo_mask V3.5 package again.
  pause
  exit /b 1
)

echo Starting mk_photo_mask V3.5 local offline server...
echo The browser will open http://127.0.0.1:8765/ or the next available local port.
echo Do not open index.html directly with file://.
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo.
  echo [ERROR] Local server exited with code %ERR%.
  pause
)
endlocal & exit /b %ERR%
