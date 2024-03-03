const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  addToCart,
  getCart,
  removeItemFromCart,
  updateCart,
  validateCoupon,
  updatePrice,
  sendCart,
} = require('../controllers/cartController');

const router = express.Router();

router.get('/get', auth, getCart, sendCart);

router.post('/coupon', auth, getCart, validateCoupon, updatePrice);

router.post('/add/:productId', auth, addToCart);

router.patch('/update/:productId', auth, updateCart);

router.patch('/remove/:productId', auth, removeItemFromCart);

module.exports = router;
