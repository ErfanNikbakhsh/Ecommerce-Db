const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

const createBlog = asynchandler(async (req, res, next) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.status(200).json({ newBlog });
  } catch (error) {
    next(error);
  }
});

module.exports = { createBlog };
