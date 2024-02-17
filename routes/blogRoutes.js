const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeTheBlog,
  dislikeTheBlog,
  checkBlogInteraction,
} = require('../controllers/blogController');

const router = express.Router();

router.get('/list', getAllBlogs);

router.get('/:id', checkBlogInteraction, getBlog);

router.post('/', auth, isAdmin, createBlog);

router.patch('/likes', auth, checkBlogInteraction, likeTheBlog);

router.patch('/dislikes', auth, checkBlogInteraction, dislikeTheBlog);

router.patch('/delete/:id', auth, isAdmin, deleteBlog);

router.patch('/:id', auth, isAdmin, updateBlog);

module.exports = router;
