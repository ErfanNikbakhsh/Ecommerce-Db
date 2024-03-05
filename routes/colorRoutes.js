const express = require('express');

const { isAdmin, auth } = require('../middlewares/authMiddleware');
const {
  getAllColors,
  getColor,
  createColor,
  deleteColor,
  updateColor,
} = require('../controllers/colorController');

const router = express.Router();

router.get('/List', auth, isAdmin, getAllColors);

router.get('/:id', auth, isAdmin, getColor);

router.post('/', auth, isAdmin, createColor);

router.patch('/:id', auth, isAdmin, updateColor);

router.delete('/:id', auth, isAdmin, deleteColor);

module.exports = router;
