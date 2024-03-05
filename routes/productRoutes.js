const express = require('express');

const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
  formatProduct,
  formatProducts,
} = require('../controllers/productController');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

const router = express.Router();

router.get('/List', getAllProducts, formatProducts);

router.get('/:id', getProduct, formatProduct);

router.post('/', auth, isAdmin, createProduct);

router.patch('/upload/:id', auth, isAdmin, uploadPhoto, productImgResize, uploadImages);

router.patch('/wishList', auth, addToWishlist);

router.patch('/rating', auth, rating);

router.patch('/delete/:id', auth, isAdmin, deleteProduct);

router.patch('/:id', auth, isAdmin, updateProduct, formatProduct);

module.exports = router;
