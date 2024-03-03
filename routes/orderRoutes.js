const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  getAllOrdersByUserId,
  getOrder,
  createOrder,
  deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.get('/list', auth, getAllOrdersByUserId);

router.get('/:orderId', auth, getOrder);

router.post('/', auth, createOrder);

router.patch('/delete/:orderId', auth, deleteOrder);

module.exports = router;
