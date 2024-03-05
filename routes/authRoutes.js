const express = require('express');

const {
  auth,
  isAdmin,
  refreshToken,
  forgotPassword,
  resetPassword,
  validateResetToken,
  updatePassword,
} = require('../middlewares/authMiddleware');

const {
  createUser,
  userLogin,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  userLogout,
  adminLogin,
  getWishlist,
  formatUser,
  formatUsers,
} = require('../controllers/userController');
const { requestLimiter } = require('../utils/Api-Features');

const router = express.Router();

router.get('/List', auth, isAdmin, getAllUsers, formatUsers);

router.get('/refreshToken', refreshToken);

router.get('/wishlist', auth, getWishlist);

router.get('/validateResetToken/:token', validateResetToken);

router.get('/:id', auth, isAdmin, getUser, formatUser);

router.post('/register', createUser);

router.post('/login', requestLimiter, userLogin);

router.post('/adminLogin', requestLimiter, adminLogin);

router.post('/forgotPassword', forgotPassword);

router.post('/logout', auth, userLogout);

router.patch('/edit', auth, updateUser, formatUser);

router.patch('/delete', auth, deleteUser);

router.patch('/changePassword', auth, updatePassword);

router.patch('/resetPassword/:token', requestLimiter, resetPassword);

router.patch('/blockUser/:id', auth, isAdmin, blockUser);

router.patch('/unBlockUser/:id', auth, isAdmin, unBlockUser);

module.exports = router;
