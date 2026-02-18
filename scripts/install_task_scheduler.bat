@echo off
REM ──────────────────────────────────────────────
REM AutoConnect WiFi - Windows Task Scheduler Setup
REM ──────────────────────────────────────────────

echo.
echo  AutoConnect WiFi - Windows Auto-Start Setup
echo  =============================================
echo.

REM Find Chrome path
set "CHROME_PATH="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if "%CHROME_PATH%"=="" (
    echo  [ERROR] Chrome not found in standard locations.
    echo  Please install Chrome or update this script with the correct path.
    pause
    exit /b 1
)

echo  Found Chrome: %CHROME_PATH%
echo.

REM Delete existing task if present
schtasks /Delete /TN "AutoConnect_WiFi_Login" /F >nul 2>&1

REM Create a scheduled task that:
REM   1. Runs at user logon
REM   2. Repeats every 4 hours indefinitely
schtasks /Create /TN "AutoConnect_WiFi_Login" ^
    /TR "\"%CHROME_PATH%\"" ^
    /SC ONLOGON ^
    /RL HIGHEST ^
    /F

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Failed to create scheduled task.
    echo  Try running this script as Administrator.
    pause
    exit /b 1
)

echo.
echo  [OK] Scheduled task created successfully!
echo.
echo  What this does:
echo    - Chrome will auto-start when you log into Windows
echo    - The AutoConnect extension checks WiFi every 4 hours
echo    - If not logged in, it auto-fills your credentials
echo.
echo  To remove later, run:
echo    schtasks /Delete /TN "AutoConnect_WiFi_Login" /F
echo.
pause
