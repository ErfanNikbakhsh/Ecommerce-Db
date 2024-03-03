const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  addToCart,
  getCart,
  removeItemFromCart,
  updateCart,
  clearCart,
  validateCoupon,
  updatePrice,
} = require('../controllers/cartController');

const router = express.Router();

router.get('/get', auth, getCart);

router.post('/coupon', auth, validateCoupon, updatePrice);

router.post('/add/:productId', auth, addToCart);

router.patch('/update/:productId', auth, updateCart);

router.patch('/remove/:productId', auth, removeItemFromCart);

router.delete('/clear', auth, clearCart);

module.exports = router;
