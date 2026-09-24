@echo off
setlocal
cd /d "%~dp0"

echo ==^> Starting Photo Privacy Tool v4.2 single-EXE build...
echo.

where wsl.exe >nul 2>nul
if errorlevel 1 (
  echo Build failed: WSL is not installed.
  echo Run this command as Administrator first:
  echo   wsl --install -d Ubuntu
  echo.
  pause
  exit /b 1
)

set "WSL_DISTRO="
for /f "usebackq delims=" %%D in (`powershell.exe -NoLogo -NoProfile -Command "$d = @(wsl.exe --list --quiet 2^>$null ^| Where-Object { $_.Trim() })[0]; if ($d) { $d.Trim() }"`) do set "WSL_DISTRO=%%D"

if not defined WSL_DISTRO (
  echo Build failed: WSL exists, but no Linux distribution is installed.
  echo.
  echo Open PowerShell as Administrator and run:
  echo   wsl --install -d Ubuntu
  echo.
  echo Restart Windows if requested, then launch Ubuntu once to finish setup.
  echo After that, install the build tools inside Ubuntu:
  echo   sudo apt update
  echo   sudo apt install -y binutils zip unzip python3
  echo.
  pause
  exit /b 1
)

echo Using WSL distribution: %WSL_DISTRO%
echo.

if not exist "%~dp0build_single_exe.sh" (
  echo Build failed: build_single_exe.sh was not found.
  echo Put this CMD file in the root of the build project.
  echo.
  pause
  exit /b 1
)

set "WSL_DIR="
for /f "usebackq delims=" %%I in (`wsl.exe -d "%WSL_DISTRO%" -- wslpath -a "%CD%" 2^>nul`) do set "WSL_DIR=%%I"

if not defined WSL_DIR (
  echo Build failed: could not resolve the WSL project path.
  echo.
  pause
  exit /b 1
)

wsl.exe -d "%WSL_DISTRO%" -- bash -lc "cd '%WSL_DIR%' && bash ./build_single_exe.sh"
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
