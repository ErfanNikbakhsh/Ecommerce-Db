const express = require('express');
const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  getAllOrdersByUserId,
  getOrder,
  createOrder,
  deleteOrder,
  sendOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { clearCart, getCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/list', auth, getAllOrdersByUserId);

router.get('/:orderId', auth, getOrder);

router.post('/', auth, getCart, createOrder, clearCart, sendOrder);

router.patch('/updateStatus/:orderId', isAdmin, auth, updateOrderStatus);

router.patch('/delete/:orderId', auth, deleteOrder);

module.exports = router;
