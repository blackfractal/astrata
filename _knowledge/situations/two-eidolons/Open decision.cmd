@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\open-situation.ps1" -Situation "two-eidolons" -Snapshot "decision"
if errorlevel 1 pause
