// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// 普通API限制
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP最多100次请求
    message: '请求过于频繁，请稍后再试'
});

// 登录尝试限制
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    max: 5, // 每个IP最多5次登录尝试
    message: '登录尝试过多，请1小时后再试'
});

// TCP连接限制
const tcpConnectionLimiter = (socket, next) => {
    const clientIP = socket.remoteAddress;
    // 实现基于IP的连接频率限制
    // ...
};

module.exports = { apiLimiter, loginLimiter, tcpConnectionLimiter };
