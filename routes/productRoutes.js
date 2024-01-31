const express = require('express');

const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { isAdmin, auth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/List', getAllProducts);

router.get('/:id', getProduct);

router.post('/', auth, isAdmin, createProduct);

router.patch('/:id', auth, isAdmin, updateProduct);

router.patch('/delete/:id', auth, isAdmin, deleteProduct);

module.exports = router;
