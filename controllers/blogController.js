const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const fs = require('fs');
const cloudinaryUploadImg = require('../utils/cloudinary');

const getBlog = asynchandler(async (req, res, next) => {
  try {
    const { blog, blogId } = req;

    // Update the Total views
    await Blog.findByIdAndUpdate(blogId, { $inc: { totalViews: 1 } }, { new: true });

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

const likeTheBlog = asynchandler(async (req, res, next) => {
  try {
    // Get the blog which you want to be liked
    const { blog, blogId, userId } = req;
    const alreadyLiked = blog.isLiked;
    const alreadyDisliked = blog.isDisliked;
    const updateQuery = { $push: {}, $pull: {} };

    if (alreadyDisliked) {
      // If the user already disliked the blog and want to like the blog.

      updateQuery.$pull.disLikes = userId;
      updateQuery.$push.likes = userId;
      updateQuery.isLiked = true;
      updateQuery.isDisliked = false;
    } else if (alreadyLiked) {
      // If the user already liked the blog and hit the like button again.

      updateQuery.$pull.likes = userId;
      updateQuery.isLiked = false;
    } else {
      // If the blog is not liked or disliked and user hit the like button.

      updateQuery.$push.likes = userId;
      updateQuery.isLiked = true;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateQuery, { new: true });

    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

const dislikeTheBlog = asynchandler(async (req, res, next) => {
  try {
    // Get the blog which you want to be disliked
    const { blog, blogId, userId } = req;
    const alreadyLiked = blog.isLiked;
    const alreadyDisliked = blog.isDisliked;
    const updateQuery = { $push: {}, $pull: {} };

    if (alreadyLiked) {
      // If the user already liked the blog and want to dislike the blog.

      updateQuery.$pull.likes = userId;
      updateQuery.$push.disLikes = userId;
      updateQuery.isLiked = false;
      updateQuery.isDisliked = true;
    } else if (alreadyDisliked) {
      // If the user already disliked the blog and hit the dislike button again.

      updateQuery.$pull.disLikes = userId;
      updateQuery.isDisliked = false;
    } else {
      // If the blog is not liked or disliked and user hit the dislike button.

      updateQuery.$push.disLikes = userId;
      updateQuery.isDisliked = true;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateQuery, { new: true });

    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

// we should show the blog for both Authenticated and not Authenticated users and
// we can not use the auth middleware to find out if the user is logged-in or not so,
// i assumed that if i get a valid userId and found a user, the user is authenticated.

const checkBlogInteraction = asynchandler(async (req, res, next) => {
  try {
    const loginUserId = req.body?.userId || req.user?._id;
    const blogId = req.params?.id || req.body?.blogId;

    isObjectIdValid(loginUserId);
    isObjectIdValid(blogId);

    const user = await User.findById(loginUserId).exec();
    const blog = await Blog.findById(blogId).exec();

    if (!blog) throw new Error('Blog Not Found');

    if (user) {
      // Find if the user has liked a blog
      const alreadyLiked = blog.likes?.find(
        (userId) => userId.toString() === loginUserId.toString()
      );

      // Find if the user has disLiked a blog
      const alreadyDisliked = blog.disLikes?.find(
        (userId) => userId.toString() === loginUserId.toString()
      );

      blog.isLiked = !!alreadyLiked;
      blog.isDisliked = !!alreadyDisliked;
    } else {
      blog.isLiked = false;
      blog.isDisliked = false;
    }

    await blog.save();

    req.userId = loginUserId;
    req.blogId = blogId;
    req.blog = blog;
    logMiddleware('checkBlogInteraction');
    next();
  } catch (error) {
    next(error);
  }
});

const uploadImages = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  const paths = req.resizedFilesPath;
  isObjectIdValid(id);

  try {
    const blog = await Blog.findById(id);

    if (!blog) throw new Error('Blog Not Found');

    // Upload files to cloudinairy
    const newPathsArray = await Promise.all(
      paths.map(async (path) => {
        const cloudResult = await cloudinaryUploadImg(path);

        // Delete the resized image
        fs.unlinkSync(path);

        return cloudResult;
      })
    );

    // Update the blog's images field with the provided cloudinary url
    blog.images.push(...newPathsArray);
    await blog.save();

    res.json(blog);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  checkBlogInteraction,
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeTheBlog,
  dislikeTheBlog,
  uploadImages,
};
