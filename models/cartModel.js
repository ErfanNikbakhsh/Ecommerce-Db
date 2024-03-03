const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        _id: false,
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: { type: Number, default: 1, min: 1 },
        color: {
          type: mongoose.Types.ObjectId,
          ref: 'Color',
        },
        price: { type: Number, required: true },
        addedAt: Date,
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    totalQuantity: { type: Number, default: 1 },
    totalPrice: Number,
    totalPayablePrice: Number,
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
