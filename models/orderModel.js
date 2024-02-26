const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        color: {
          type: mongoose.Types.ObjectId,
          ref: 'Color',
        },
        price: Number,
        buyPrice: Number,
      },
    ],
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    totalPrice: Number,
    totalPayablePrice: Number,
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
