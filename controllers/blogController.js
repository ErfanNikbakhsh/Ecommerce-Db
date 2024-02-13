const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

const getBlog = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const blog = await Blog.findById(id);

    // Update the Total views
    await Blog.findByIdAndUpdate(id, { $inc: { totalViews: 1 } }, { new: true });

    res.status(200).json({ blog });
  } catch (error) {
    next(error);
  }
});

const getAllBlogs = asynchandler(async (req, res, next) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

const createBlog = asynchandler(async (req, res, next) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(201).json({ newBlog });
  } catch (error) {
    next(error);
  }
});

const updateBlog = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ updatedBlog });
  } catch (error) {
    next(error);
  }
});

const deleteBlog = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const deletedBlog = await Blog.findByIdAndUpdate(id, { softDelete: true }, { new: true });
    res.status(204).json({ deletedBlog });
  } catch (error) {
    next(error);
  }
});

module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog };
