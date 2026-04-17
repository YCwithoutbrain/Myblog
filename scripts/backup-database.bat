@echo off
chcp 65001 >nul
title 博客数据库备份脚本
color 0B

echo ========================================
echo   个人博客数据库备份脚本
echo ========================================
echo.

REM 设置路径
set BACKUP_DIR=%~dp0..\backups
set MONGODUMP="C:\Program Files\MongoDB\Server\6.0\bin\mongodump.exe"
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_NAME=blog_backup_%DATE%_%TIME%

REM 创建备份目录
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [信息] 开始备份数据库...
echo 备份时间: %DATE% %TIME%
echo 备份目录: %BACKUP_DIR%

REM 执行备份
%MONGODUMP% --uri="mongodb://localhost:27017/personal_blog" ^
    --out="%BACKUP_DIR%\%BACKUP_NAME%"

if errorlevel 1 (
    echo [错误] 数据库备份失败
    pause
    exit /b 1
)

REM 压缩备份
echo [信息] 压缩备份文件...
cd "%BACKUP_DIR%"
tar -czf "%BACKUP_NAME%.tar.gz" "%BACKUP_NAME%"

REM 删除原始备份文件夹
rmdir /s /q "%BACKUP_NAME%"

REM 清理旧备份（保留最近30天）
echo [信息] 清理旧备份文件...
forfiles /p "%BACKUP_DIR%" /m *.tar.gz /d -30 /c "cmd /c del @path"

echo.
echo ========================================
echo   备份完成！
echo ========================================
echo.
echo 备份文件: %BACKUP_NAME%.tar.gz
echo 文件大小:
for %%F in ("%BACKUP_DIR%\%BACKUP_NAME%.tar.gz") do echo   %%~zF 字节
echo.
echo 备份位置: %BACKUP_DIR%
echo.

REM 记录日志
echo %DATE% %TIME% - 数据库备份完成: %BACKUP_NAME%.tar.gz >> "%BACKUP_DIR%\backup.log"

pause
exit /b 0
