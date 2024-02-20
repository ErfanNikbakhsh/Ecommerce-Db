const Coupon = require('../models/couponModel');
const asynchandler = require('express-async-handler');
const { nanoid } = require('nanoid');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');

const getCoupon = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id).exec();

    if (!coupon) throw new Error('Coupon Not Found');

    res.status(200).json({ coupon });
  } catch (error) {
    next(error);
  }
});

const getAllCoupons = asynchandler(async (req, res, next) => {
  try {
    const coupon = await Coupon.find().lean().exec();
    res.json(coupon);
  } catch (error) {
    next(error);
  }
});

const createCoupon = asynchandler(async (req, res, next) => {
  try {
    const couponData = req.body;

    // Generate coupon code
    const code = nanoid(process.env.COUPON_LENGTH);

    couponData.expiry = Date.now() + couponData?.expiry * 24 * 60 * 60 * 1000;

    const NewCoupon = await Coupon.create({ ...couponData, code });

    res.status(201).json(NewCoupon);
  } catch (error) {
    next(error);
  }
});

const updateCoupon = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ updatedCoupon });
  } catch (error) {
    next(error);
  }
});

const deleteCoupon = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    // Expire the coupon
    const updatedExpiry = Date.now() - 60 * 60 * 1000;

    const deletedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { softDelete: true, expiry: updatedExpiry },
      { new: true }
    );
    res.status(204).json({ deletedCoupon });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createCoupon,
  updateCoupon,
  getCoupon,
  getAllCoupons,
  deleteCoupon,
};
