const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    // 如果已经登录，直接跳到dashboard
    if (req.session.userId) {
        return res.redirect('/admin/posts');
    }
    res.render('admin/login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME) {
        const storedPwd = process.env.ADMIN_PASSWORD;
        // 如果是bcrypt哈希
        let match = false;
        if (storedPwd && storedPwd.startsWith('$2')) {
            match = await bcrypt.compare(password, storedPwd);
        } else {
            // 明文比对
            match = (password === storedPwd);
        }

        if (match) {
            req.session.userId = 'admin'; // 在 auth middleware 中检查 userId
            req.flash('success', '登录成功！');
            return res.redirect('/admin/posts');
        }
    }

    req.flash('error', '用户名或密码错误');
    res.redirect('/admin');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin');
});

module.exports = router;
