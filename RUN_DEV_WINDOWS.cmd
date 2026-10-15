@echo off
cd /d "%~dp0"
echo VUONG QUOC TOAN HOC - Cai dependencies...
call npm.cmd install
if errorlevel 1 (
  echo Loi npm install. Kiem tra Node.js va Internet.
  pause
  exit /b 1
)
echo Da cai. Bat dau game...
call npm.cmd run dev
pause
