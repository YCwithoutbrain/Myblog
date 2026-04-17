@echo off
chcp 65001 >nul
title Personal Blog Server - Production Mode
color 0A

echo ========================================
echo   个人博客系统 - 生产环境启动脚本
echo ========================================
echo.

REM 检查Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] Node.js未安装或未添加到PATH
    echo 请安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查MongoDB服务
sc query MongoDB >nul 2>nul
if errorlevel 1 (
    echo [警告] MongoDB服务未运行
    echo 正在启动MongoDB服务...
    net start MongoDB
    if errorlevel 1 (
        echo [错误] 无法启动MongoDB服务
        echo 请手动安装MongoDB: https://www.mongodb.com/try/download/community
        pause
        exit /b 1
    )
)

REM 检查PM2
where pm2 >nul 2>nul
if errorlevel 1 (
    echo [信息] 安装PM2进程管理器...
    npm install -g pm2
)

REM 切换到项目目录
cd /d "%~dp0.."

REM 安装依赖（如果第一次运行）
if not exist "node_modules" (
    echo [信息] 安装项目依赖...
    npm install
)

REM 创建必要目录
if not exist "logs" mkdir logs
if not exist "public\uploads" mkdir public\uploads
if not exist "backups" mkdir backups
if not exist "temp" mkdir temp

REM 设置环境变量
set NODE_ENV=production
set NODE_PATH=C:\Program Files\nodejs

REM 启动应用（使用PM2）
echo [信息] 启动博客服务器...
pm2 start server.js --name "personal-blog" ^
    --log "logs\app.log" ^
    --error "logs\error.log" ^
    --output "logs\access.log" ^
    --time ^
    --merge-logs

REM 保存PM2配置
pm2 save

echo.
echo ========================================
echo   服务启动完成！
echo ========================================
echo.
echo 访问地址: http://localhost:3000
echo 管理面板: http://localhost:3000/admin
echo TCP端口: 3001 (telnet localhost 3001)
echo.
echo PM2命令:
echo   pm2 status             查看状态
echo   pm2 logs personal-blog 查看日志
echo   pm2 restart personal-blog 重启服务
echo   pm2 stop personal-blog    停止服务
echo.
echo 按任意键打开浏览器...
pause >nul
start http://localhost:3000

exit /b 0
