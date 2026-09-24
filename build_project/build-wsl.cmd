@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

where wsl.exe >nul 2>nul
if errorlevel 1 (
  echo [錯誤] 尚未安裝 WSL。請先以系統管理員身分執行：wsl --install -d Ubuntu
  pause
  exit /b 1
)

for /f "usebackq delims=" %%I in (`wsl.exe wslpath -a "%CD%"`) do set "WSL_DIR=%%I"
wsl.exe bash -lc "cd '%WSL_DIR%' && bash ./build_single_exe.sh"

if errorlevel 1 (
  echo.
  echo [錯誤] 編譯失敗，請查看上方訊息。
) else (
  echo.
  echo [成功] 執行檔位於 output 資料夾。
)
pause
endlocal
