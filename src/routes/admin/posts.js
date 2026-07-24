const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const Post = require('../../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 图片上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('只允许上传图片文件'));
    }
});

// 视频上传配置
const uploadVideo = multer({
    storage, limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExt = /mp4|webm|mov|mkv|avi|flv/;
        const allowedMime = /video\/mp4|video\/webm|video\/quicktime|video\/x-matroska|video\/x-msvideo|video\/x-flv/;
        if (allowedExt.test(path.extname(file.originalname).toLowerCase()) &&
            allowedMime.test(file.mimetype)) return cb(null, true);
        cb(new Error('只允许上传 MP4/WebM/MOV 等视频文件'));
    }
});

// ============================================================
// 📤 上传路由
// ============================================================

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '没有提供文件' });
        const url = '/' + req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        res.json({ url });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '没有提供视频文件' });
        const url = '/' + req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        res.json({ url });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// 📋 文章列表 / 新建 / 编辑
// ============================================================

router.get('/', async (req, res) => {
    const searchQuery = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 20; const skip = (page - 1) * limit;
    let searchCondition = {};
    if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, 'i');
        searchCondition = { $or: [{ title: searchRegex }, { content: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }] };
    }
    const [posts, total] = await Promise.all([
        Post.find(searchCondition).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(searchCondition)
    ]);
    res.render('admin/dashboard', { title: searchQuery ? `搜索结果: ${searchQuery}` : '文章管理', posts, searchQuery, currentPage: page, totalPages: Math.ceil(total / limit) });
});

router.get('/new', (req, res) => {
    res.render('admin/editor', { title: '新建文章', post: null, action: '/admin/posts' });
});

router.get('/edit/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.redirect('/admin/posts');
        res.render('admin/editor', { title: '编辑文章', post, action: `/admin/posts/${post._id}?_method=PUT` });
    } catch (error) { res.redirect('/admin/posts'); }
});

// ============================================================
// ✍️ 创建 / 更新 / 删除
// ============================================================

router.post('/', upload.single('featuredImage'), async (req, res) => {
    try {
        const postData = {
            title: req.body.title,
            slug: req.body.slug || (Date.now().toString(36) + Math.random().toString(36).substring(2,5)),
            content: req.body.content, excerpt: req.body.excerpt,
            category: req.body.category,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            isPinned: req.body.isPinned === 'on', isPublished: req.body.isPublished === 'on',
            videoUrl: req.body.videoUrl || undefined,
            featuredVideo: req.body.featuredVideo || undefined
        };
        if (req.file) postData.featuredImage = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        const post = new Post(postData); await post.save();
        req.flash('success', '文章创建成功'); res.redirect('/admin/posts');
    } catch (error) { console.error('Error creating post:', error); req.flash('error', '创建文章失败'); res.redirect('/admin/posts/new'); }
});

router.put('/:id', upload.single('featuredImage'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('文章未找到');
        post.title = req.body.title; post.slug = req.body.slug || post.slug;
        post.content = req.body.content; post.excerpt = req.body.excerpt; post.category = req.body.category;
        post.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];
        post.isPinned = req.body.isPinned === 'on'; post.isPublished = req.body.isPublished === 'on';
        post.videoUrl = req.body.videoUrl || undefined;
        post.featuredVideo = req.body.featuredVideo || undefined;
        if (req.file) {
            if (post.featuredImage) { const oldPath = path.join(__dirname, '../../public', post.featuredImage); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); }
            post.featuredImage = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        }
        await post.save(); req.flash('success', '文章更新成功'); res.redirect('/admin/posts');
    } catch (error) { console.error('Error updating post:', error); req.flash('error', '更新文章失败'); res.redirect(`/admin/posts/edit/${req.params.id}`); }
});

router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: '文章未找到' });
        if (post.featuredImage) { const ip = path.join(__dirname, '../../public', post.featuredImage); if (fs.existsSync(ip)) fs.unlinkSync(ip); }
        await post.deleteOne(); req.flash('success', '文章删除成功'); res.redirect('/admin/posts');
    } catch (error) { console.error('Error deleting post:', error); req.flash('error', '删除失败'); res.redirect('/admin/posts'); }
});

module.exports = router;
