const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Color = require('../models/colorModel');

const getColor = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const color = await Color.findById(id).exec();

    if (!color) throw new Error('Color Not Found!');

    res.status(200).send({
      colorId: color?._id,
      title: color?.title,
    });
  } catch (error) {
    next(error);
  }
});

const getAllColors = asynchandler(async (req, res, next) => {
  try {
    const colors = await Color.find().exec();

    res.status(200).send(
      colors.map((color) => {
        return {
          colorId: color?._id,
          title: color?.title,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

const createColor = asynchandler(async (req, res, next) => {
  try {
    const newColor = await Color.create(req.body);

    res.status(201).send({
      colorId: newColor?._id,
      title: newColor?.title,
    });
  } catch (error) {
    next(error);
  }
});

const updateColor = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedColor = await Color.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedColor) throw new Error('Color Not Found!');

    res.status(200).send({
      colorId: updatedColor?._id,
      title: updatedColor?.title,
    });
  } catch (error) {
    next(error);
  }
});

const deleteColor = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const deletedColor = await Color.findByIdAndDelete(id, { new: true });

    if (!deletedColor) throw new Error('Color Not Found!');

    res.status(204).json({ deletedColor });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createColor,
  updateColor,
  getColor,
  getAllColors,
  deleteColor,
};
