const Coupon = require('../models/couponModel');
const asynchandler = require('express-async-handler');
const { nanoid } = require('nanoid');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');

const getCoupon = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id).exec();

    if (!coupon) throw new Error('Coupon Not Found');

    res.status(200).send({
      couponId: coupon?._id,
      code: coupon?.code,
      expiry: coupon?.expiry,
      discountType: coupon?.discountType,
      discountAmount: coupon?.discountAmount,
      usageLimit: coupon?.usageLimit,
      currentUsage: coupon?.currentUsage,
      minOrderAmount: coupon?.minOrderAmount,
    });
  } catch (error) {
    next(error);
  }
});

const getAllCoupons = asynchandler(async (req, res, next) => {
  try {
    const coupons = await Coupon.find().lean().exec();

    res.status(200).send(
      coupons.map((coupon) => {
        return {
          couponId: coupon?._id,
          code: coupon?.code,
          expiry: coupon?.expiry,
          discountType: coupon?.discountType,
          discountAmount: coupon?.discountAmount,
          usageLimit: coupon?.usageLimit,
          currentUsage: coupon?.currentUsage,
          minOrderAmount: coupon?.minOrderAmount,
        };
      })
    );
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

    res.status(201).send({
      couponId: NewCoupon?._id,
      code: NewCoupon?.code,
      expiry: NewCoupon?.expiry,
      discountType: NewCoupon?.discountType,
      discountAmount: NewCoupon?.discountAmount,
      usageLimit: NewCoupon?.usageLimit,
      currentUsage: NewCoupon?.currentUsage,
      minOrderAmount: NewCoupon?.minOrderAmount,
    });
  } catch (error) {
    next(error);
  }
});

const updateCoupon = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    isObjectIdValid(id);

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true }).exec();

    if (!updatedCoupon) throw new Error('Coupon Not Found');

    res.status(200).send({
      couponId: updatedCoupon?._id,
      code: updatedCoupon?.code,
      expiry: updatedCoupon?.expiry,
      discountType: updatedCoupon?.discountType,
      discountAmount: updatedCoupon?.discountAmount,
      usageLimit: updatedCoupon?.usageLimit,
      currentUsage: updatedCoupon?.currentUsage,
      minOrderAmount: updatedCoupon?.minOrderAmount,
    });
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
    ).exec();

    if (!deletedCoupon) throw new Error('Coupon Not Found');

    res.sendStatus(204);
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
