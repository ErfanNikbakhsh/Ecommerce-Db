const express = require('express');

const { auth } = require('../middlewares/authMiddleware');

const {
  createUser,
  userLogin,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} = require('../controllers/userController');

const router = express.Router();

router.get('/usersList', getAllUsers);

router.get('/:id', auth, getUser);

router.post('/register', createUser);

router.post('/login', userLogin);

router.patch('/:id', updateUser);

router.patch('/delete/:id', deleteUser);

module.exports = router;
