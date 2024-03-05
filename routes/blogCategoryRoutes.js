const express = require('express');

const {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogCategory,
  getAllBlogCategories,
} = require('../controllers/blogCategoryController');
const { isAdmin, auth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/list', auth, isAdmin, getAllBlogCategories);

router.get('/:id', auth, isAdmin, getBlogCategory);

router.post('/', auth, isAdmin, createBlogCategory);

router.patch('/delete/:id', auth, isAdmin, deleteBlogCategory);

router.patch('/:id', auth, isAdmin, updateBlogCategory);

module.exports = router;
