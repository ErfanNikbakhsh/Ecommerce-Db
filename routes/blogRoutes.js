const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const { createBlog } = require('../controllers/blogController');

const router = express.Router();

router.post('/', auth, isAdmin, createBlog);

module.exports = router;
