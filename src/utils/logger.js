// src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log')
        }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// TCP连接日志
exports.logTCPConnection = (socket, action) => {
    logger.info('TCP连接', {
        action,
        clientIP: socket.remoteAddress,
        timestamp: new Date().toISOString()
    });
};

// 管理员操作日志
exports.logAdminAction = (userId, action, details) => {
    logger.info('管理员操作', {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
