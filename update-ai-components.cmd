@echo off
setlocal
cd /d "%~dp0"
echo ================================================================
echo  mk_photo_mask V4.2 - AI Components Updater
echo  MediaPipe Tasks Vision 1.0.1
echo ================================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-ai-components.ps1"
set ERR=%ERRORLEVEL%
echo.
if not "%ERR%"=="0" (
  echo Update failed. ErrorLevel=%ERR%
  pause
  exit /b %ERR%
)
echo AI components update completed.
pause
