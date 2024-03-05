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
  uploadImages,
} = require('../controllers/blogController');
const { uploadPhoto, blogImgResize } = require('../middlewares/uploadImages');

const router = express.Router();

router.get('/list', getAllBlogs);

router.get('/:id', checkBlogInteraction, getBlog);

router.post('/', auth, isAdmin, createBlog);

router.patch('/likes', auth, checkBlogInteraction, likeTheBlog);

router.patch('/dislikes', auth, checkBlogInteraction, dislikeTheBlog);

router.patch('/upload/:id', auth, isAdmin, uploadPhoto, blogImgResize, uploadImages);

router.patch('/delete/:id', auth, isAdmin, deleteBlog);

router.patch('/:id', auth, isAdmin, updateBlog);

module.exports = router;
