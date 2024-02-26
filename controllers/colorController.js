const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Color = require('../models/colorModel');

const getColor = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const color = await Color.findById(id).exec();

    res.status(200).json({ color });
  } catch (error) {
    next(error);
  }
});

const getAllColors = asynchandler(async (req, res, next) => {
  try {
    const colors = await Color.find().exec();

    res.json(colors);
  } catch (error) {
    next(error);
  }
});

const createColor = asynchandler(async (req, res, next) => {
  try {
    const newColor = await Color.create(req.body);
    res.status(201).json({ newColor });
  } catch (error) {
    next(error);
  }
});

const updateColor = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedColor = await Color.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ updatedColor });
  } catch (error) {
    next(error);
  }
});

const deleteColor = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const deletedColor = await Color.findByIdAndDelete(id, { new: true });
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
