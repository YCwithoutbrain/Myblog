const mongoose = require('mongoose');

// 最小可用的 User 模型：Post.author 的 populate 依赖它存在，
// 后台登录本身走 .env 的 ADMIN_USERNAME / ADMIN_PASSWORD，不查这张表。
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String },
    role: { type: String, default: 'admin' },
    displayName: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
