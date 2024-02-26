const Brand = require('../models/brandModel');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

const getBrand = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const brand = await Brand.findById(id);
    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
});

const getAllBrands = asynchandler(async (req, res, next) => {
  try {
    const brand = await Brand.find();
    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
});

const createBrand = asynchandler(async (req, res, next) => {
  try {
    const newBrand = await Brand.create(req.body);
    res.status(201).json(newBrand);
  } catch (error) {
    next(error);
  }
});

const updateBrand = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedBrand);
  } catch (error) {
    next(error);
  }
});

const deleteBrand = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    await Brand.findByIdAndUpdate(id, { softDelete: true }, { new: true });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrands,
};
