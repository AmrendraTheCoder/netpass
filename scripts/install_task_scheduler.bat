@echo off
REM ──────────────────────────────────────────────
REM NetPass — Windows Auto-Start Setup
REM Supports: Chrome, Brave, Edge, Firefox, Opera, Vivaldi
REM ──────────────────────────────────────────────

echo.
echo  NetPass — Browser Auto-Start Setup (Windows)
echo  =============================================
echo.

REM ── Detect installed browsers ──
set "COUNT=0"
set "BROWSER_1="
set "BROWSER_2="
set "BROWSER_3="
set "BROWSER_4="
set "BROWSER_5="
set "BROWSER_6="

REM Google Chrome
set "CHROME_PATH="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)
if defined CHROME_PATH (
    set /a COUNT+=1
    set "BROWSER_%COUNT%_NAME=Google Chrome"
    set "BROWSER_%COUNT%_PATH=%CHROME_PATH%"
    echo  %COUNT%. Google Chrome
)

REM Brave
set "BRAVE_PATH="
if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"
) else if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    set "BRAVE_PATH=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
)
if defined BRAVE_PATH (
    set /a COUNT+=1
    set "BROWSER_%COUNT%_NAME=Brave"
    set "BROWSER_%COUNT%_PATH=%BRAVE_PATH%"
    echo  %COUNT%. Brave
)

REM Microsoft Edge
set "EDGE_PATH="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)
if defined EDGE_PATH (
    set /a COUNT+=1
    set "BROWSER_%COUNT%_NAME=Microsoft Edge"
    set "BROWSER_%COUNT%_PATH=%EDGE_PATH%"
    echo  %COUNT%. Microsoft Edge
)

REM Firefox
set "FIREFOX_PATH="
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    set "FIREFOX_PATH=C:\Program Files\Mozilla Firefox\firefox.exe"
) else if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" (
    set "FIREFOX_PATH=C:\Program Files (x86)\Mozilla Firefox\firefox.exe"
)
if defined FIREFOX_PATH (
    set /a COUNT+=1
    set "BROWSER_%COUNT%_NAME=Firefox"
    set "BROWSER_%COUNT%_PATH=%FIREFOX_PATH%"
    echo  %COUNT%. Firefox
)

REM Opera
set "OPERA_PATH="
if exist "%LOCALAPPDATA%\Programs\Opera\opera.exe" (
    set "OPERA_PATH=%LOCALAPPDATA%\Programs\Opera\opera.exe"
) else if exist "C:\Program Files\Opera\opera.exe" (
    set "OPERA_PATH=C:\Program Files\Opera\opera.exe"
)
if defined OPERA_PATH (
    set /a COUNT+=1
    set "BROWSER_%COUNT%_NAME=Opera"
    set "BROWSER_%COUNT%_PATH=%OPERA_PATH%"
    echo  %COUNT%. Opera
)

REM Vivaldi
set "VIVALDI_PATH="
if exist "%LOCALAPPDATA%\Vivaldi\Application\vivaldi.exe" (
    set "VIVALDI_PATH=%LOCALAPPDATA%\Vivaldi\Application\vivaldi.exe"
)
if defined VIVALDI_PATH (
    set /a COUNT+=1
    set "BROWSER_%COUNT%_NAME=Vivaldi"
    set "BROWSER_%COUNT%_PATH=%VIVALDI_PATH%"
    echo  %COUNT%. Vivaldi
)

echo.

if %COUNT% EQU 0 (
    echo  [ERROR] No supported browsers found.
    echo  Install Chrome, Brave, Edge, Firefox, Opera, or Vivaldi first.
    pause
    exit /b 1
)

REM ── Let user pick ──
set /p CHOICE="Select browser to auto-start [1-%COUNT%] (default: 1): "
if "%CHOICE%"=="" set "CHOICE=1"

REM Map selection to path and name
set "SELECTED_PATH="
set "SELECTED_NAME="

if "%CHOICE%"=="1" (
    set "SELECTED_NAME=%BROWSER_1_NAME%"
    set "SELECTED_PATH=%BROWSER_1_PATH%"
)
if "%CHOICE%"=="2" (
    set "SELECTED_NAME=%BROWSER_2_NAME%"
    set "SELECTED_PATH=%BROWSER_2_PATH%"
)
if "%CHOICE%"=="3" (
    set "SELECTED_NAME=%BROWSER_3_NAME%"
    set "SELECTED_PATH=%BROWSER_3_PATH%"
)
if "%CHOICE%"=="4" (
    set "SELECTED_NAME=%BROWSER_4_NAME%"
    set "SELECTED_PATH=%BROWSER_4_PATH%"
)
if "%CHOICE%"=="5" (
    set "SELECTED_NAME=%BROWSER_5_NAME%"
    set "SELECTED_PATH=%BROWSER_5_PATH%"
)
if "%CHOICE%"=="6" (
    set "SELECTED_NAME=%BROWSER_6_NAME%"
    set "SELECTED_PATH=%BROWSER_6_PATH%"
)

if not defined SELECTED_PATH (
    echo.
    echo  [ERROR] Invalid selection.
    pause
    exit /b 1
)

echo.
echo  Selected: %SELECTED_NAME%
echo  Path: %SELECTED_PATH%
echo.

REM ── Delete existing task if present ──
schtasks /Delete /TN "NetPass_WiFi_Login" /F >nul 2>&1

REM ── Create the scheduled task ──
schtasks /Create /TN "NetPass_WiFi_Login" ^
    /TR "\"%SELECTED_PATH%\"" ^
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
echo    - %SELECTED_NAME% will auto-start when you log into Windows
echo    - The NetPass extension checks WiFi every 4 hours
echo    - If not logged in, it auto-fills your credentials
echo.
echo  To remove later, run:
echo    schtasks /Delete /TN "NetPass_WiFi_Login" /F
echo.
pause
