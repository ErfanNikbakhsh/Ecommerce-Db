const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    brand: { type: mongoose.Types.ObjectId, ref: 'Brand' },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'ProdCategory',
    },
    quantity: { type: Number, required: true },
    sold: {
      type: Number,
      default: 0,
    },
    images: [
      {
        publicId: String,
        url: String,
      },
    ],
    color: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Color',
      },
    ],
    ratings: [
      {
        star: Number,
        postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        comment: String,
      },
    ],
    totalRating: {
      type: String,
      default: 0,
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
