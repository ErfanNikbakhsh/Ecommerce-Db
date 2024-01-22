const express = require('express');

const { auth, isAdmin } = require('../middlewares/authMiddleware');

const {
  createUser,
  userLogin,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
} = require('../controllers/userController');

const router = express.Router();

router.get('/usersList', auth, isAdmin, getAllUsers);

router.get('/:id', auth, isAdmin, getUser);

router.post('/register', createUser);

router.post('/login', userLogin);

router.patch('/edit', auth, updateUser);

router.patch('/delete', auth, deleteUser);

router.patch('/blockUser/:id', auth, isAdmin, blockUser);

router.patch('/unBlockUser/:id', auth, isAdmin, unBlockUser);

module.exports = router;
