const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  deleteCoupon,
  updateCoupon,
} = require('../controllers/couponController');

const router = express.Router();

router.get('/list', auth, isAdmin, getAllCoupons);

router.get('/:id', auth, isAdmin, getCoupon);

router.post('/', auth, isAdmin, createCoupon);

router.patch('/delete/:id', auth, isAdmin, deleteCoupon);

router.patch('/:id', auth, isAdmin, updateCoupon);

module.exports = router;
