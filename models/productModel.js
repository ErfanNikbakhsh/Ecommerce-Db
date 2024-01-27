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
      required: true,
    },
    brand: { type: String, enum: ['Apple', 'Samsung', 'Lenovo'] },
    categoryId: {
      type: String,
      required: true,
    },
    quantity: { type: Number, required: true },
    sold: {
      type: Number,
      default: 0,
    },
    images: Array,
    color: {
      type: String,
      enum: ['Black', 'Brown', 'Red'],
    },
    ratings: [
      {
        star: Number,
        postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
