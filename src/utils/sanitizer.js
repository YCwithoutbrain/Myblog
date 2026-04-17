// src/utils/sanitizer.js
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

const sanitizeOptions = {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span'],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class', 'id', 'style']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'ftp']
};

exports.sanitizeContent = (content) => {
    return sanitizeHtml(content, sanitizeOptions);
};

exports.validatePost = (postData) => {
    const errors = [];

    if (!validator.isLength(postData.title, { min: 1, max: 200 })) {
        errors.push('标题长度必须在1-200字符之间');
    }

    if (!validator.isLength(postData.content, { min: 10 })) {
        errors.push('内容太短');
    }

    if (postData.tags && postData.tags.length > 10) {
        errors.push('标签数量不能超过10个');
    }

    return errors;
};
