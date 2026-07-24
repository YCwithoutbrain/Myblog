const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const Post = require('../../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 上传存储配置
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

// 图片上传（5MB）
const uploadImage = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) &&
            allowed.test(file.mimetype)) return cb(null, true);
        cb(new Error('只允许上传图片文件'));
    }
});

// 视频上传（100MB）
const uploadVideo = multer({
    storage, limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /mp4|webm|mov|mkv|avi|flv/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) &&
            /video\//.test(file.mimetype)) return cb(null, true);
        cb(new Error('只允许上传视频文件'));
    }
});

// 封面上传（图片+视频，100MB）
const uploadCover = multer({
    storage, limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const imgOk = /\.(jpeg|jpg|png|gif|webp)$/i.test(ext) && /image\//.test(file.mimetype);
        const vidOk = /\.(mp4|webm|mov|mkv|avi|flv)$/i.test(ext) && /video\//.test(file.mimetype);
        if (imgOk || vidOk) return cb(null, true);
        cb(new Error('封面只支持图片(JPG/PNG/GIF/WebP)或视频(MP4/WebM/MOV)'));
    }
});

// ============================================================
// 上传路由
// ============================================================

// Markdown 图片上传
router.post('/upload', uploadImage.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '没有提供文件' });
        const url = '/' + req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        res.json({ url });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Markdown 视频上传
router.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '没有提供视频文件' });
        const url = '/' + req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        res.json({ url });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// 页面路由
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
// 创建 / 更新 / 删除
// ============================================================

router.post('/', uploadCover.single('featuredImage'), async (req, res) => {
    try {
        const isVideo = (file) => file && /video\//.test(file.mimetype);
        const postData = {
            title: req.body.title,
            slug: req.body.slug || (Date.now().toString(36) + Math.random().toString(36).substring(2,5)),
            content: req.body.content, excerpt: req.body.excerpt,
            category: req.body.category,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            isPinned: req.body.isPinned === 'on', isPublished: req.body.isPublished === 'on',
        };
        // 📸 封面图片 / 🎬 封面视频
        if (req.file) {
            const url = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
            if (isVideo(req.file)) {
                postData.featuredVideo = url;
            } else {
                postData.featuredImage = url;
            }
        }
        // 封面视频链接（URL 或 iframe）
        if (req.body.featuredVideo && req.body.featuredVideo.trim()) {
            postData.featuredVideo = req.body.featuredVideo.trim();
        }
        const post = new Post(postData); await post.save();
        req.flash('success', '文章创建成功'); res.redirect('/admin/posts');
    } catch (error) { console.error('Error creating post:', error); req.flash('error', '创建文章失败'); res.redirect('/admin/posts/new'); }
});

router.put('/:id', uploadCover.single('featuredImage'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('文章未找到');
        post.title = req.body.title; post.slug = req.body.slug || post.slug;
        post.content = req.body.content; post.excerpt = req.body.excerpt; post.category = req.body.category;
        post.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [];
        post.isPinned = req.body.isPinned === 'on'; post.isPublished = req.body.isPublished === 'on';
        if (req.file) {
            const url = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
            if (/video\//.test(req.file.mimetype)) {
                if (post.featuredVideo) { const old = path.join(__dirname, '../../public', post.featuredVideo); if (fs.existsSync(old)) fs.unlinkSync(old); }
                post.featuredVideo = url;
            } else {
                if (post.featuredImage) { const old = path.join(__dirname, '../../public', post.featuredImage); if (fs.existsSync(old)) fs.unlinkSync(old); }
                post.featuredImage = url;
            }
        }
        if (req.body.featuredVideo && req.body.featuredVideo.trim()) {
            post.featuredVideo = req.body.featuredVideo.trim();
        }
        await post.save(); req.flash('success', '文章更新成功'); res.redirect('/admin/posts');
    } catch (error) { console.error('Error updating post:', error); req.flash('error', '更新文章失败'); res.redirect(`/admin/posts/edit/${req.params.id}`); }
});

router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: '文章未找到' });
        for (const p of [post.featuredImage, post.featuredVideo]) {
            if (p) { const fp = path.join(__dirname, '../../public', p); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
        }
        await post.deleteOne(); req.flash('success', '文章删除成功'); res.redirect('/admin/posts');
    } catch (error) { console.error('Error deleting post:', error); req.flash('error', '删除失败'); res.redirect('/admin/posts'); }
});

module.exports = router;
