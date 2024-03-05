const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        _id: false,
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: { type: Number, min: 1 },
        color: {
          type: mongoose.Types.ObjectId,
          ref: 'Color',
        },
        price: { type: Number, required: true },
      },
    ],
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    totalQuantity: { type: Number, min: 1 },
    totalPrice: Number,
    totalPayablePrice: Number,
    orderCode: { type: String, unique: true },
    orderStatus: {
      type: String,
      enum: [
        'Not Processed',
        'Processing',
        'Cash On Delivery',
        'Dispatched',
        'Cancelled',
        'Delivered',
      ],
      default: 'Not Processed',
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

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
