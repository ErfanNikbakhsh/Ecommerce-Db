const express = require('express');

const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrands,
} = require('../controllers/brandController');
const { isAdmin, auth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/list', auth, isAdmin, getAllBrands);

router.get('/:id', auth, isAdmin, getBrand);

router.post('/', auth, isAdmin, createBrand);

router.patch('/delete/:id', auth, isAdmin, deleteBrand);

router.patch('/:id', auth, isAdmin, updateBrand);

module.exports = router;
