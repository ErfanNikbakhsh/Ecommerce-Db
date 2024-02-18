const ProdCategory = require('../models/prodCategoryModel');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');

const getProdCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const category = await ProdCategory.findById(id);
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

const getAllProdCategories = asynchandler(async (req, res, next) => {
  try {
    const category = await ProdCategory.find();
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

const createProdCategory = asynchandler(async (req, res, next) => {
  try {
    const newCategory = await ProdCategory.create(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

const updateProdCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedCategory = await ProdCategory.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

const deleteProdCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    await ProdCategory.findByIdAndUpdate(id, { softDelete: true }, { new: true });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createProdCategory,
  updateProdCategory,
  deleteProdCategory,
  getProdCategory,
  getAllProdCategories,
};
