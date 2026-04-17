@echo off
chcp 65001 >nul
title 涓汉鍗氬绯荤粺 - Windows涓€閿儴缃?
color 0F

echo ========================================
echo   涓汉鍗氬绯荤粺 Windows涓€閿儴缃茶剼鏈?
echo ========================================
echo.
echo 姝よ剼鏈皢瀹屾垚浠ヤ笅鎿嶄綔:
echo 1. 妫€鏌ョ郴缁熺幆澧?
echo 2. 瀹夎蹇呰杞欢
echo 3. 閰嶇疆鏁版嵁搴?
echo 4. 閮ㄧ讲鍗氬绯荤粺
echo 5. 閰嶇疆鍐呯綉绌块€?
echo.
echo 鎸?Ctrl+C 鍙栨秷...

REM 闃舵1: 鐜妫€鏌?
echo.
echo ========================================
echo   闃舵1: 鐜妫€鏌?
echo ========================================
echo.

REM 妫€鏌indows鐗堟湰
ver | find "10." > nul
if errorlevel 1 (
    echo [璀﹀憡] 鎺ㄨ崘浣跨敤Windows 10鎴栨洿楂樼増鏈?
)

REM 妫€鏌ode.js
where node >nul 2>nul
if errorlevel 1 (
    echo [閿欒] Node.js鏈畨瑁?
    echo 姝ｅ湪鎵撳紑Node.js涓嬭浇椤甸潰...
    start https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi
    echo 璇峰畨瑁匩ode.js鍚庨噸鏂拌繍琛屾鑴氭湰
    
    exit /b 1
)
echo [鎴愬姛] Node.js宸插畨瑁?
node --version

REM 妫€鏌pm
where npm >nul 2>nul
if errorlevel 1 (
    echo [閿欒] npm鏈壘鍒?
    
    exit /b 1
)
echo [鎴愬姛] npm宸插畨瑁?
npm --version

REM 闃舵2: 瀹夎MongoDB
echo.
echo ========================================
echo   闃舵2: 瀹夎MongoDB
echo ========================================
echo.

sc query MongoDB >nul 2>nul
if errorlevel 1 (
    echo [淇℃伅] MongoDB鏈畨瑁咃紝姝ｅ湪瀹夎...
    call "%~dp0..\windows-services\install-mongodb.bat"
) else (
    echo [鎴愬姛] MongoDB鏈嶅姟宸茶繍琛?
)

REM 闃舵3: 瀹夎椤圭洰渚濊禆
echo.
echo ========================================
echo   闃舵3: 瀹夎椤圭洰渚濊禆
echo ========================================
echo.

cd /d "%~dp0.."
echo [淇℃伅] 瀹夎椤圭洰渚濊禆...
npm install

if errorlevel 1 (
    echo [閿欒] 渚濊禆瀹夎澶辫触
    
    exit /b 1
)
echo [鎴愬姛] 椤圭洰渚濊禆瀹夎瀹屾垚

REM 闃舵4: 鍒濆鍖栨暟鎹簱
echo.
echo ========================================
echo   闃舵4: 鍒濆鍖栨暟鎹簱
echo ========================================
echo.

echo [淇℃伅] 鍒濆鍖栨暟鎹簱...
node scripts/init-database.js

if errorlevel 1 (
    echo [閿欒] 鏁版嵁搴撳垵濮嬪寲澶辫触
    
    exit /b 1
)

REM 闃舵5: 瀹夎Windows鏈嶅姟
echo.
echo ========================================
echo   闃舵5: 瀹夎Windows鏈嶅姟
echo ========================================
echo.

echo [淇℃伅] 瀹夎鍗氬绯荤粺鏈嶅姟...
call "%~dp0..\windows-services\install-blog-service.bat"

echo.
echo ========================================
echo   闃舵6: 閰嶇疆鍐呯綉绌块€?
echo ========================================
echo.


)

echo.
echo ========================================
echo   馃帀 閮ㄧ讲瀹屾垚锛?
echo ========================================
echo.
echo 鍗氬绯荤粺宸叉垚鍔熼儴缃插埌鎮ㄧ殑Windows涓绘満锛?
echo.
echo 馃搷 鏈湴璁块棶:
echo    鍓嶅彴: http://localhost:3000
echo    鍚庡彴: http://localhost:3000/admin
echo    TCP: telnet localhost 3001 echo    绯荤粺淇℃伅: http://localhost:3000/api/system-info
echo.
)
echo.
echo 馃敡 鏃ュ父绠＄悊:
echo    鍚姩鏈嶅姟: net start PersonalBlog
echo    鍋滄鏈嶅姟: net stop PersonalBlog
echo    鏌ョ湅鏃ュ織: 鏌ョ湅 logs\ 鐩綍
echo    澶囦唤鏁版嵁: 杩愯 scripts\backup-database.bat
echo.
echo 馃摓 鏁呴殰鎺掗櫎:
echo    1. 绔彛鍗犵敤: netstat -ano | findstr :3000
echo    2. 鏈嶅姟鐘舵€? sc query PersonalBlog
echo    3. MongoDB: net start MongoDB
echo    4. 闃茬伀澧? 纭繚3000鍜?001绔彛寮€鏀?
echo.
echo ========================================
echo   鎸変换鎰忛敭瀹屾垚閮ㄧ讲...
 >nul

REM 娓呯悊涓存椂鏂囦欢
if exist temp\*.* del /q temp\*.*

echo.
echo 馃帄 鎵€鏈夐儴缃叉楠ゅ凡瀹屾垚锛?
echo 馃挕 寤鸿閲嶅惎璁＄畻鏈轰互纭繚鎵€鏈夋湇鍔℃甯稿惎鍔ㄣ€?
echo.
echo 鎸変换鎰忛敭閫€鍑?..
 >nul

exit /b 0


