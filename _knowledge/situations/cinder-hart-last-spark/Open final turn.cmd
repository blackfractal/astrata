@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\open-situation.ps1" -Situation "cinder-hart-last-spark" -Snapshot "final-turn"
if errorlevel 1 pause

