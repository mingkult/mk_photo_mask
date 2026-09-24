@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\publish-to-github.ps1" %*
if errorlevel 1 (
  echo.
  echo Publish failed.
  pause
  exit /b 1
)
echo.
echo Publish completed.
pause
