const BlogCategory = require('../models/blogCategoryModel');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');

const getBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const category = await BlogCategory.findById(id).exec();

    if (!category) throw new Error('Category Not Found!');

    res.status(200).send({
      categoryId: category?._id,
      title: category?.title,
    });
  } catch (error) {
    next(error);
  }
});

const getAllBlogCategories = asynchandler(async (req, res, next) => {
  try {
    const categories = await BlogCategory.find().exec();

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

const createBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const newCategory = await BlogCategory.create(req.body);

    res.status(201).send({
      categoryId: newCategory?._id,
      title: newCategory?.title,
    });
  } catch (error) {
    next(error);
  }
});

const updateBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();

    if (!updatedCategory) throw new Error('Category Not Found!');

    res.status(200).send({
      categoryId: updatedCategory?._id,
      title: updatedCategory?.title,
    });
  } catch (error) {
    next(error);
  }
});

const deleteBlogCategory = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const deletedCategory = await BlogCategory.findByIdAndUpdate(
      id,
      { softDelete: true },
      { new: true }
    ).exec();

    if (!deletedCategory) throw new Error('Category Not Found!');

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
