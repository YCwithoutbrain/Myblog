// src/utils/tcpHandler.js
const Post = require('../models/Post');
const fs = require('fs').promises;
const path = require('path');

const handleTCPCommand = async (command, socket) => {
    const [cmd, ...args] = command.split(' ');

    switch (cmd.toUpperCase()) {
        case 'HELP':
            socket.write(`
可用命令:
  HELP - 显示帮助
  LIST [page] - 列出文章
  GET <slug> - 获取文章内容
  CREATE <title> <content> - 创建文章
  DELETE <slug> - 删除文章
  STATS - 显示统计信息
  BACKUP - 创建备份
  EXIT - 断开连接
            `.trim());
            break;

        case 'LIST':
            const page = parseInt(args[0]) || 1;
            const limit = 10;
            const posts = await Post.find({ isPublished: true })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('title slug createdAt');

            socket.write(`第 ${page} 页文章:\n`);
            posts.forEach((post, index) => {
                socket.write(`${index + 1}. ${post.title} (${post.slug})\n`);
            });
            break;

        case 'GET':
            if (!args[0]) {
                socket.write('错误: 需要指定文章slug\n');
                break;
            }
            const post = await Post.findOne({ slug: args[0] });
            if (post) {
                socket.write(`标题: ${post.title}\n`);
                socket.write(`日期: ${post.createdAt.toLocaleString()}\n`);
                socket.write(`内容:\n${post.content.substring(0, 500)}...\n`);
            } else {
                socket.write('文章未找到\n');
            }
            break;

        case 'STATS':
            const totalPosts = await Post.countDocuments();
            const publishedPosts = await Post.countDocuments({ isPublished: true });
            const pinnedPosts = await Post.countDocuments({ isPinned: true });

            socket.write(`
博客统计:
  总文章数: ${totalPosts}
  已发布: ${publishedPosts}
  置顶文章: ${pinnedPosts}
  数据库: MongoDB
  运行时间: ${process.uptime().toFixed(0)}秒
            `.trim());
            break;

        case 'BACKUP':
            const backupDir = path.join(__dirname, '../../backups');
            await fs.mkdir(backupDir, { recursive: true });
            const backupFile = path.join(backupDir, `backup-${Date.now()}.json`);

            const allPosts = await Post.find();
            await fs.writeFile(backupFile, JSON.stringify(allPosts, null, 2));

            socket.write(`备份已创建: ${backupFile}\n`);
            break;

        case 'EXIT':
            socket.write('再见!\n');
            socket.end();
            break;

        default:
            socket.write(`未知命令: ${cmd}\n输入 HELP 查看可用命令\n`);
    }
};

module.exports = { handleTCPCommand };
