@echo off
setlocal
chcp 65001 >nul
title mk_photo_mask V4.2 build dlib Lite helper EXE
cd /d "%~dp0"

if not exist ".venv" (
  py -3.11 -m venv .venv
)
call ".venv\Scripts\activate.bat"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt pyinstaller

rmdir /s /q build 2>nul
rmdir /s /q dist 2>nul
pyinstaller --clean --noconfirm --onefile --name advanced_ai_helper advanced_ai_helper.py
if exist "dist\advanced_ai_helper.exe" (
  copy /y "dist\advanced_ai_helper.exe" "..\app\advanced_ai_helper.exe" >nul
  copy /y "dist\advanced_ai_helper.exe" "..\advanced_ai_helper.exe" >nul
  echo ?????????advanced_ai_helper.exe ???????????? app\ ???????????????
)
endlocal
