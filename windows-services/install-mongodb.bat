@echo off
chcp 65001 >nul
title 瀹夎MongoDB Windows鏈嶅姟
color 0E

echo ========================================
echo   MongoDB Windows鏈嶅姟瀹夎鑴氭湰
echo ========================================
echo.

REM 妫€鏌ユ槸鍚︿互绠＄悊鍛樿韩浠借繍琛?
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [閿欒] 璇蜂互绠＄悊鍛樿韩浠借繍琛屾鑴氭湰
    exit /b 1
)

REM 璁剧疆MongoDB璺緞
set MONGO_PATH=C:\Program Files\MongoDB
set DATA_PATH=D:\MongoDB\data
set LOG_PATH=D:\MongoDB\log

REM 鍒涘缓鏁版嵁鐩綍
if not exist "%DATA_PATH%" (
    mkdir "%DATA_PATH%"
    echo [淇℃伅] 鍒涘缓鏁版嵁鐩綍: %DATA_PATH%
)

REM 鍒涘缓鏃ュ織鐩綍
if not exist "%LOG_PATH%" (
    mkdir "%LOG_PATH%"
    echo [淇℃伅] 鍒涘缓鏃ュ織鐩綍: %LOG_PATH%
)

REM 涓嬭浇MongoDB锛堝鏋滀笉瀛樺湪锛?
if not exist "%MONGO_PATH%\bin\mongod.exe" (
    echo [淇℃伅] MongoDB鏈畨瑁咃紝姝ｅ湪涓嬭浇...

    REM 鏂规硶1锛氫娇鐢ㄥ畼鏂筂SI瀹夎绋嬪簭
    echo 璇锋墜鍔ㄤ笅杞藉苟瀹夎MongoDB Community Edition:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo 瀹夎鏃惰閫夋嫨:
    echo 1. 瀹屾暣瀹夎
    echo 2. 瀹夎涓烘湇鍔?
    echo 3. 鏁版嵁鐩綍: %DATA_PATH%
    echo 4. 鏃ュ織鐩綍: %LOG_PATH%
    echo.
    exit /b 0
)

REM 鍒涘缓閰嶇疆鏂囦欢
echo # MongoDB閰嶇疆鏂囦欢 > "%MONGO_PATH%\mongod.cfg"
echo systemLog: >> "%MONGO_PATH%\mongod.cfg"
echo   destination: file >> "%MONGO_PATH%\mongod.cfg"
echo   path: "%LOG_PATH%\mongod.log" >> "%MONGO_PATH%\mongod.cfg"
echo   logAppend: true >> "%MONGO_PATH%\mongod.cfg"
echo. >> "%MONGO_PATH%\mongod.cfg"
echo storage: >> "%MONGO_PATH%\mongod.cfg"
echo   dbPath: "%DATA_PATH%" >> "%MONGO_PATH%\mongod.cfg"
echo   journal: >> "%MONGO_PATH%\mongod.cfg"
echo     enabled: true >> "%MONGO_PATH%\mongod.cfg"
echo. >> "%MONGO_PATH%\mongod.cfg"
echo net: >> "%MONGO_PATH%\mongod.cfg"
echo   bindIp: 127.0.0.1 >> "%MONGO_PATH%\mongod.cfg"
echo   port: 27017 >> "%MONGO_PATH%\mongod.cfg"

echo [淇℃伅] 閰嶇疆鏂囦欢宸插垱寤? %MONGO_PATH%\mongod.cfg

REM 瀹夎Windows鏈嶅姟
echo [淇℃伅] 瀹夎MongoDB Windows鏈嶅姟...
"%MONGO_PATH%\bin\mongod.exe" --config "%MONGO_PATH%\mongod.cfg" --install

REM 鍚姩鏈嶅姟
echo [淇℃伅] 鍚姩MongoDB鏈嶅姟...
net start MongoDB

echo.
echo ========================================
echo   MongoDB鏈嶅姟瀹夎瀹屾垚锛?
echo ========================================
echo.
echo 鏈嶅姟鐘舵€? MongoDB (宸插惎鍔?
echo 鏁版嵁鐩綍: %DATA_PATH%
echo 鏃ュ織鏂囦欢: %LOG_PATH%\mongod.log
echo 杩炴帴鍦板潃: mongodb://localhost:27017
echo.
echo 绠＄悊鍛戒护:
echo   net start MongoDB    鍚姩鏈嶅姟
echo   net stop MongoDB     鍋滄鏈嶅姟
echo   sc delete MongoDB    鍒犻櫎鏈嶅姟
echo.


exit /b 0
