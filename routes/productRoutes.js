const express = require('express');

const { createProduct, getProduct, getAllProducts } = require('../controllers/productController');

const router = express.Router();

router.get('/List', getAllProducts);

router.get('/:id', getProduct);

router.post('/', createProduct);

module.exports = router;
