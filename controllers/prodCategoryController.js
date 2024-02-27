const ProdCategory = require('../models/prodCategoryModel');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');

const getProdCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const category = await ProdCategory.findById(id).exec();

    if (!category) throw new Error('Category Not Found');

    res.status(200).send({
      categoryId: category?._id,
      title: category?.title,
    });
  } catch (error) {
    next(error);
  }
});

const getAllProdCategories = asynchandler(async (req, res, next) => {
  try {
    const categories = await ProdCategory.find().exec();

    res.status(200).send(
      categories.map((category) => {
        return {
          categoryId: category?._id,
          title: category?.title,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

const createProdCategory = asynchandler(async (req, res, next) => {
  try {
    const newCategory = await ProdCategory.create(req.body);

    res.status(201).send({
      categoryId: newCategory?._id,
      title: newCategory?.title,
    });
  } catch (error) {
    next(error);
  }
});

const updateProdCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedCategory = await ProdCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();

    if (!updatedCategory) throw new Error('Category Not Found');

    res.status(200).send({
      categoryId: updatedCategory?._id,
      title: updatedCategory?.title,
    });
  } catch (error) {
    next(error);
  }
});

const deleteProdCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const deletedCategory = await ProdCategory.findByIdAndUpdate(
      id,
      { softDelete: true },
      { new: true }
    ).exec();

    if (!deletedCategory) throw new Error('Category Not Found');

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
