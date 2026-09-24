@echo off
setlocal
chcp 65001 >nul
title mk_photo_mask V4.2 dlib Lite helper
cd /d "%~dp0"

if not exist ".venv" (
  py -3.11 -m venv .venv
)
call ".venv\Scripts\activate.bat"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
echo.
echo ?????? dlib Lite helper???127.0.0.1:8777???...
python advanced_ai_helper.py --host 127.0.0.1 --port 8777
endlocal
