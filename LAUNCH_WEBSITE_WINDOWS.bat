@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py -3 launch_local.py
) else (
    python launch_local.py
)
pause
