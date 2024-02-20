const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'freeShipping'],
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    currentUsage: {
      type: Number,
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
