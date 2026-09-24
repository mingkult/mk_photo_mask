@echo off
setlocal
cd /d "%~dp0"

echo ==^> Starting Photo Privacy Tool Windows-native single-EXE build...
echo.

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo Build failed: Windows PowerShell was not found.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-windows-singlefile.ps1"
set "EXITCODE=%ERRORLEVEL%"

echo.
if not "%EXITCODE%"=="0" (
  echo Build failed. Exit code: %EXITCODE%
) else (
  echo Build completed successfully.
  echo The EXE is under: output\
)

echo.
pause
exit /b %EXITCODE%
