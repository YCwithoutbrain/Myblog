const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const Post = require('../../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 文件上传配置（图片）
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('只允许上传图片文件'));
    }
});

// 视频上传（独立配置：100MB，接受视频格式）
const uploadVideo = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowedExt = /mp4|webm|mov|mkv|avi|flv/;
        const allowedMime = /video\/mp4|video\/webm|video\/quicktime|video\/x-matroska|video\/x-msvideo|video\/x-flv/;
        const ext = allowedExt.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedMime.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('只允许上传 MP4/WebM/MOV/MKV/AVI/FLV 视频文件'));
    }
});

// Markdown 编辑器图片上传
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '没有提供文件' });
        const url = '/' + req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 视频上传
router.post('/upload-video', uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: '没有提供文件' });
        const url = '/' + req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建文章（支持视频封面）
router.post('/', upload.single('featuredImage'), async (req, res) => {
    try {
        const postData = {
            ...req.body,
            author: req.session.user._id
        };
        if (req.file) {
            postData.featuredImage = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        }
        // 视频封面：如果传了 videoCoverUrl，把它放到 featuredVideo 字段
        if (req.body.featuredVideo) {
            postData.featuredVideo = req.body.featuredVideo;
        }
        await Post.create(postData);
        res.redirect('/admin/posts');
    } catch (error) {
        res.status(400).render('admin/editor', {
            title: '新建文章',
            action: '/admin/posts',
            post: req.body,
            error: error.message
        });
    }
});

// 更新文章（支持视频封面）
router.put('/:id', upload.single('featuredImage'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('文章不存在');
        Object.assign(post, req.body);
        if (req.file) {
            post.featuredImage = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        }
        if (req.body.featuredVideo) {
            post.featuredVideo = req.body.featuredVideo;
        }
        await post.save();
        res.redirect('/admin/posts');
    } catch (error) {
        res.status(400).render('admin/editor', {
            title: '编辑文章',
            action: '/admin/posts/' + req.params.id + '?_method=PUT',
            post: req.body,
            error: error.message
        });
    }
});

module.exports = router;
