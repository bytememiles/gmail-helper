@echo off
REM Run the PowerShell build script (bypass execution policy for this run)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1"
if errorlevel 1 pause
