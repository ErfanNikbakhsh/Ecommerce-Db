const BlogCategory = require('../models/blogCategoryModel');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');

const getBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const category = await BlogCategory.findById(id);
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

const getAllBlogCategories = asynchandler(async (req, res, next) => {
  try {
    const category = await BlogCategory.find();
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

const createBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const newCategory = await BlogCategory.create(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

const updateBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

const deleteBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    await BlogCategory.findByIdAndUpdate(id, { softDelete: true }, { new: true });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogCategory,
  getAllBlogCategories,
};
