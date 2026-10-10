@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\open-situation.ps1" -Situation "two-wings" -Snapshot "opening"
if errorlevel 1 pause
