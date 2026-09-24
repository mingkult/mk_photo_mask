@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================================
echo mk_photo_mask V4.2 - Prepare bundled dlib Lite
echo ============================================================
echo.

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Windows PowerShell was not found.
  pause
  exit /b 1
)

if not exist "%~dp0prepare-bundled-runtime.ps1" (
  echo [ERROR] prepare-bundled-runtime.ps1 was not found.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0prepare-bundled-runtime.ps1" %*
set "ERR=%ERRORLEVEL%"

if not "%ERR%"=="0" (
  echo.
  echo [ERROR] prepare-bundled-runtime.ps1 failed with code %ERR%.
  pause
) else (
  echo.
  echo [OK] Bundled dlib Lite runtime is ready.
  echo Next, run build-windows-singlefile.cmd from the project root.
  pause
)

endlocal & exit /b %ERR%
