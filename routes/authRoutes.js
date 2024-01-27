const express = require('express');

const { auth, isAdmin, refreshToken } = require('../middlewares/authMiddleware');

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

router.post('/register', createUser);

router.post('/login', userLogin);

router.post('/logout', userLogout);

router.patch('/edit', auth, updateUser);

router.patch('/delete', auth, deleteUser);

router.patch('/blockUser/:id', auth, isAdmin, blockUser);

router.patch('/unBlockUser/:id', auth, isAdmin, unBlockUser);

module.exports = router;
