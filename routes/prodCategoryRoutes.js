const express = require('express');

const {
  createProdCategory,
  updateProdCategory,
  deleteProdCategory,
  getProdCategory,
  getAllProdCategories,
} = require('../controllers/prodCategoryController');
const { isAdmin, auth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/list', auth, isAdmin, getAllProdCategories);

router.get('/:id', auth, isAdmin, getProdCategory);

router.post('/', auth, isAdmin, createProdCategory);

router.patch('/delete/:id', auth, isAdmin, deleteProdCategory);

router.patch('/:id', auth, isAdmin, updateProdCategory);

module.exports = router;
