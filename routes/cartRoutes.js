const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const { addToCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/');

router.post('/coupon');

router.post('/add/:productId', addToCart);

router.post('/move-to-wishlist/:productId');

router.patch('/update/:productId');

router.delete('/clear');

router.delete('/delete/:productId');

module.exports = router;
