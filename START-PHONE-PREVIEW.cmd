@echo off
setlocal
pushd "%~dp0" || exit /b 1
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js, then open this file again.
  pause
  exit /b 1
)
node start.mjs --lan
if errorlevel 1 pause
popd
