// 初始化数据库和默认管理员账户
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const Post = require('../src/models/Post');

async function initDatabase() {
    try {
        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ 数据库连接成功');

        // 创建管理员用户（如果不存在）
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
            const adminUser = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                displayName: '系统管理员'
            });
            await adminUser.save();
            console.log('✅ 管理员账户创建成功');
            console.log(`   用户名: admin`);
            console.log(`   密码: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
        } else {
            console.log('ℹ️  管理员账户已存在');
        }

        // 创建示例文章（如果数据库为空）
        const postCount = await Post.countDocuments();
        if (postCount === 0) {
            const examplePost = new Post({
                title: '欢迎来到我的个人博客',
                slug: 'welcome-to-my-blog',
                content: `# 欢迎！

这是我的个人博客系统，基于Node.js + MongoDB构建。

## 功能特点

- 📝 文章发布与管理
- 🔐 管理员后台
- 🔌 TCP远程管理
- 📱 响应式设计
- 🚀 高性能架构

## 技术栈

- **后端**: Node.js, Express, MongoDB
- **前端**: EJS, Bootstrap, JavaScript
- **部署**: Windows服务, PM2进程管理
- **网络**: OpenFRP内网穿透

## 开始使用

1. 访问管理面板: /admin
2. 创建你的第一篇文章
3. 通过TCP连接管理内容
4. 自定义你的博客样式

> 这是一个示例文章，你可以在管理面板中编辑或删除它。`,
                excerpt: '这是我的个人博客系统介绍，基于Node.js + MongoDB构建。',
                category: 'blog',
                tags: ['博客', 'Node.js', 'MongoDB', '教程'],
                isPinned: true,
                isPublished: true,
                featuredImage: '',
                author: adminExists ? adminExists._id : null
            });
            await examplePost.save();
            console.log('✅ 示例文章创建成功');
        }

        console.log('\n🎉 数据库初始化完成！');
        console.log('🌐 访问地址: http://localhost:3000');
        console.log('🔧 管理面板: http://localhost:3000/admin');
        console.log('🔌 TCP连接: telnet localhost 3001');

        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

initDatabase();
