const asynchandler = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const slugify = require('slugify');
const fs = require('fs');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const cloudinaryUploadImg = require('../utils/cloudinary');

const getAllProducts = asynchandler(async (req, res, next) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((e) => delete queryObj[e]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));
    // Question: What's the point of using await at the end of this middleware, and not in the code above?
    // Answer: Because if we do that we will execute the query and other functionalities will be redundant.
    // We are adding to the query object and then at the end of the middleware we are executing it by using await or exec method.

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page;
    const limit = req.query.limit;

    if (req.query.page && req.query.limit) {
      const skip = (page - 1) * limit;
      const countQuery = await Product.find(JSON.parse(queryStr)).countDocuments();

      if (skip >= countQuery) throw new Error('This page does not exist!');

      query = query.skip(skip).limit(limit);
    }

    const products = await query.lean().exec();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

const getProduct = asynchandler(async (req, res, next) => {
  try {
    const productId = req.params.id;
    isObjectIdValid(productId);

    const product = await Product.findById(productId).exec();
    res.status(200).json(product);

    logMiddleware('getProduct');
  } catch (error) {
    next(error);
  }
});

const createProduct = asynchandler(async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      id: newProduct._id,
      message: 'Product Created Successfully',
    });
  } catch (error) {
    next(error);
  }
});

const updateProduct = asynchandler(async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const productId = req.params.id;
    isObjectIdValid(productId);

    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });
    if (!updatedProduct) {
      res.status(404).send('Product Not Found');
    }
    res.status(200).json({
      id: updatedProduct._id,
      message: 'Product Updated Successfully',
    });
  } catch (error) {
    next(error);
  }
});

const deleteProduct = asynchandler(async (req, res, next) => {
  try {
    const productId = req.params.id;
    isObjectIdValid(productId);

    const deletedProduct = await Product.findByIdAndUpdate(
      productId,
      { softdelete: true },
      { new: true }
    );
    if (!deletedProduct) {
      res.status(404).send('Product Not Found');
    }
    res.status(204);
  } catch (error) {
    next(error);
  }
});

const addToWishlist = asynchandler(async (req, res, next) => {
  const { productId } = req.body;
  const user = req.user;

  try {
    const alreadyAdded = user.wishlist.find((id) => id.toString() === productId);

    if (alreadyAdded) {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $pull: { wishlist: productId } },
        { new: true }
      );

      res.json(updatedUser);
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $push: { wishlist: productId },
        },
        { new: true }
      );

      res.json(updatedUser);
    }
  } catch (error) {
    next(error);
  }
});

const rating = asynchandler(async (req, res, next) => {
  const userId = req.user._id;
  const { star, productId, comment } = req.body;

  let updateQuery;
  let queryCondition;

  const validStars = [1, 2, 3, 4, 5];
  if (!validStars.includes(star)) throw new Error(`star's value should be an integer between 1-5`);

  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found.');
    }

    // Check if the user has already rated the product
    let alreadyRated = product?.ratings?.find(
      (item) => item.postedBy.toString() === userId.toString()
    );

    if (alreadyRated) {
      // If user has already rated, update the existing rating
      queryCondition = { ratings: { $elemMatch: alreadyRated } };
      updateQuery = { $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } };
    } else {
      // If user has not rated yet, add a new rating
      queryCondition = { _id: productId };
      updateQuery = { $push: { ratings: { star, comment, postedBy: userId } } };
    }

    // Add or update the product's rating
    const updatedProduct = await Product.findOneAndUpdate(queryCondition, updateQuery, {
      new: true,
    });

    if (!updatedProduct) {
      throw new Error('Failed to update product rating.');
    }

    // Calculate the total rating and average rating
    let totalRating = updatedProduct?.ratings?.length;
    let ratingSum = updatedProduct?.ratings?.map((item) => item.star).reduce((a, c) => a + c, 0);
    let averageRating = Math.round(ratingSum / totalRating);

    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      {
        totalRating: averageRating,
      },
      { new: true }
    );

    if (!finalProduct) {
      throw new Error('Failed to update product total rating.');
    }

    res.json(finalProduct);
  } catch (error) {
    next(error);
  }
});

const uploadImages = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  const paths = req.resizedFilesPath;
  isObjectIdValid(id);

  try {
    const product = await Product.findById(id);

    if (!product) throw new Error('Product Not Found');

    // Upload files to cloudinairy
    const newPathsArray = await Promise.all(
      paths.map(async (path) => {
        const cloudResult = await cloudinaryUploadImg(path);

        // Delete the resized image
        fs.unlinkSync(path);

        return cloudResult;
      })
    );

    // Update the product's images field with the provided cloudinary url
    product.images.push(...newPathsArray);
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
};
