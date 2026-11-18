@echo off
chcp 65001 >nul
title 博客系统Windows服务安装
color 0C

echo ========================================
echo   个人博客系统Windows服务安装
echo ========================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本
    pause
    exit /b 1
)

REM 设置路径
set PROJECT_DIR=%~dp0..
set NODE_EXE=C:\Program Files\nodejs\node.exe
set SERVICE_NAME=PersonalBlog
set SERVICE_DESC="个人博客系统 - Node.js + MongoDB"

REM 检查Node.js
if not exist "%NODE_EXE%" (
    echo [错误] Node.js未安装
    echo 请安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 安装PM2 Windows服务
echo [信息] 安装PM2 Windows服务...
cd /d "%PROJECT_DIR%"
npm install -g pm2
pm2 install pm2-windows-startup
pm2 startup

REM 创建服务配置文件
echo [信息] 创建服务配置...
echo { > "%PROJECT_DIR%\pm2-config.json"
echo   "apps": [{ >> "%PROJECT_DIR%\pm2-config.json"
echo     "name": "personal-blog", >> "%PROJECT_DIR%\pm2-config.json"
echo     "script": "server.js", >> "%PROJECT_DIR%\pm2-config.json"
echo     "cwd": "%PROJECT_DIR%", >> "%PROJECT_DIR%\pm2-config.json"
echo     "instances": 1, >> "%PROJECT_DIR%\pm2-config.json"
echo     "autorestart": true, >> "%PROJECT_DIR%\pm2-config.json"
echo     "watch": false, >> "%PROJECT_DIR%\pm2-config.json"
echo     "max_memory_restart": "1G", >> "%PROJECT_DIR%\pm2-config.json"
echo     "env": { >> "%PROJECT_DIR%\pm2-config.json"
echo       "NODE_ENV": "production", >> "%PROJECT_DIR%\pm2-config.json"
echo       "PORT": "3000" >> "%PROJECT_DIR%\pm2-config.json"
echo     }, >> "%PROJECT_DIR%\pm2-config.json"
echo     "log_date_format": "YYYY-MM-DD HH:mm:ss", >> "%PROJECT_DIR%\pm2-config.json"
echo     "error_file": "logs/err.log", >> "%PROJECT_DIR%\pm2-config.json"
echo     "out_file": "logs/out.log", >> "%PROJECT_DIR%\pm2-config.json"
echo     "merge_logs": true >> "%PROJECT_DIR%\pm2-config.json"
echo   }] >> "%PROJECT_DIR%\pm2-config.json"
echo } >> "%PROJECT_DIR%\pm2-config.json"

REM 启动应用
echo [信息] 启动博客应用...
pm2 start "%PROJECT_DIR%\pm2-config.json"

REM 保存PM2配置
pm2 save

REM 创建Windows服务
echo [信息] 创建Windows服务...
pm2 start "%PROJECT_DIR%\pm2-config.json"
pm2 save
pm2 startup

echo.
echo ========================================
echo   Windows服务安装完成！
echo ========================================
echo.
echo 服务名称: %SERVICE_NAME%
echo 服务描述: %SERVICE_DESC%
echo 安装路径: %PROJECT_DIR%
echo.
echo 服务状态:
sc query %SERVICE_NAME%
echo.
echo 管理命令:
echo   net start %SERVICE_NAME%     启动服务
echo   net stop %SERVICE_NAME%      停止服务
echo   sc query %SERVICE_NAME%      查询状态
echo   sc delete %SERVICE_NAME%     删除服务
echo.
echo PM2命令:
echo   pm2 status                   查看应用状态
echo   pm2 logs                     查看日志
echo   pm2 restart personal-blog    重启应用
echo   pm2 stop personal-blog       停止应用
echo.
echo 按任意键打开服务管理器...
pause >nul
services.msc

exit /b 0
