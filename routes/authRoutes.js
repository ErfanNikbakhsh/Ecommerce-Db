const express = require('express');

const {
  auth,
  isAdmin,
  refreshToken,
  forgotPassword,
  resetPassword,
  validateResetToken,
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
} = require('../controllers/userController');

const router = express.Router();

router.get('/List', auth, isAdmin, getAllUsers);

router.get('/:id', auth, isAdmin, getUser);

router.get('/refreshToken', refreshToken);

router.get('/validateResetToken/:token', validateResetToken);

router.post('/register', createUser);

router.post('/login', userLogin);

router.post('/forgotPassword', forgotPassword);

router.post('/logout', auth, userLogout);

router.patch('/edit', auth, updateUser);

router.patch('/delete', auth, deleteUser);

router.patch('/resetPassword/:token', resetPassword);

router.patch('/blockUser/:id', auth, isAdmin, blockUser);

router.patch('/unBlockUser/:id', auth, isAdmin, unBlockUser);

module.exports = router;
