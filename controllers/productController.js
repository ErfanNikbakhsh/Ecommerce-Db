const asynchandler = require('express-async-handler');
const Product = require('../models/productModel');
const { logMiddleware } = require('../utils');

const createProduct = asynchandler(async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      id: newProduct._id,
      message: 'Product Created Successfully',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getProduct = asynchandler(async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.status(200).json(product);

    logMiddleware('getProduct');
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProducts = asynchandler(async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { createProduct, getProduct, getAllProducts };
