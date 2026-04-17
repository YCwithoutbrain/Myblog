// src/routes/public/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {}
    };

    try {
        // 检查数据库连接
        const dbState = mongoose.connection.readyState;
        health.services.database = dbState === 1 ? 'connected' : 'disconnected';

        // 检查TCP服务器
        health.services.tcp = 'active'; // 简化检查

        // 检查磁盘空间
        const checkDiskSpace = require('check-disk-space').default;
        const diskInfo = await checkDiskSpace('/');
        health.services.disk = {
            free: Math.round(diskInfo.free / 1024 / 1024 / 1024), // GB
            total: Math.round(diskInfo.size / 1024 / 1024 / 1024) // GB
        };

        // 如果有服务异常，更新状态
        if (health.services.database !== 'connected') {
            health.status = 'unhealthy';
        }

        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router;
