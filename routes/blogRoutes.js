const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
} = require('../controllers/blogController');

const router = express.Router();

router.get('/list', getAllBlogs);

router.get('/:id', getBlog);

router.post('/', auth, isAdmin, createBlog);

router.patch('/delete/:id', auth, isAdmin, deleteBlog);

router.patch('/:id', auth, isAdmin, updateBlog);

module.exports = router;
