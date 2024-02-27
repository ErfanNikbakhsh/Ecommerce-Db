const Brand = require('../models/brandModel');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

const getBrand = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const brand = await Brand.findById(id).exec();

    if (!brand) throw new Error('Brand Not Found');

    res.status(200).send({
      brandId: brand?._id,
      title: brand?.title,
    });
  } catch (error) {
    next(error);
  }
});

const getAllBrands = asynchandler(async (req, res, next) => {
  try {
    const brands = await Brand.find().exec();

    res.status(200).send(
      brands.map((brand) => {
        return {
          brandId: brand?._id,
          title: brand?.title,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

const createBrand = asynchandler(async (req, res, next) => {
  try {
    const newBrand = await Brand.create(req.body);

    res.status(201).send({
      brandId: newBrand?._id,
      title: newBrand?.title,
    });
  } catch (error) {
    next(error);
  }
});

const updateBrand = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true }).exec();

    if (!updatedBrand) throw new Error('Brand Not Found');

    res.status(200).send({
      brandId: updatedBrand?._id,
      title: updatedBrand?.title,
    });
  } catch (error) {
    next(error);
  }
});

const deleteBrand = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const deletedBrand = await Brand.findByIdAndUpdate(id, { softDelete: true }, { new: true });

    if (!deletedBrand) throw new Error('Brand Not Found');

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
