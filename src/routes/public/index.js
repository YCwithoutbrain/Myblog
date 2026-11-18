const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');
const Post = require('../../models/Post');   // 新增：引入 Post 模型

router.use(require('./health'));

router.get('/', postController.getHomepage);
router.get('/tag/:tag', (req, res) => {
    req.query.q = req.params.tag;
    return postController.getHomepage(req, res);
});
router.get('/post/:slug', postController.getPostBySlug);

// 临时页面占位
router.get('/projects', (req, res) => res.render('public/projects'));
router.get('/lab', (req, res) => res.render('public/lab'));
router.get('/about', (req, res) => res.render('public/about'));

// RSS 订阅（修复版：从数据库取文章）
router.get('/rss.xml', async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(20);

        const items = posts.map(p => {
            const url = `https://blog.ycwithoutbrain.top/post/${p.slug}`;
            const desc = (p.excerpt || p.content || '')
                .replace(/<[^>]+>/g, '')   // 去 HTML 标签
                .slice(0, 500);
            return `\n    <item>\n      <title><![CDATA[${p.title}]]></title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>${p.createdAt.toUTCString()}</pubDate>\n      <description><![CDATA[${desc}]]></description>\n    </item>`;
        }).join('');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>YC 的博客</title>\n    <link>https://blog.ycwithoutbrain.top/</link>\n    <description>YC 的技术博客</description>${items}\n  </channel>\n</rss>`;

        res.type('application/rss+xml');
        res.send(xml);
    } catch (err) {
        console.error('RSS 生成失败:', err);
        res.status(500).send('Error generating RSS');
    }
});

module.exports = router;
