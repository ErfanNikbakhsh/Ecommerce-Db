const asynchandler = require('express-async-handler');
const uniqid = require('uniqid');
const { logMiddleware, isObjectIdValid } = require('../utils/Api-Features');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const getOrder = asynchandler(async (req, res, next) => {
  try {
    const { orderId } = req.params;
    isObjectIdValid(orderId);

    const order = await Order.findOne()
      .where('_id')
      .equals(orderId)
      .populate('products.productId', 'title _id images')
      .exec();

    if (!order) throw new Error('Order Not Found!');

    res.status(200).send({
      orderId: order?._id,
      products: order?.products.map((product) => {
        return {
          productId: product?.productId?._id,
          title: product?.productId?.title,
          images: product?.productId?.images,
          quantity: product?.quantity,
          color: product?.color,
          price: product?.price,
        };
      }),
      totalQuantity: order?.totalQuantity,
      totalPrice: order?.totalPrice,
      totalPayablePrice: order?.totalPayablePrice,
      orderStatus: order?.orderStatus,
    });
  } catch (error) {
    next(error);
  }
});

const getAllOrdersByUserId = asynchandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ orderBy: userId })
      .populate('products.productId', 'title _id images')
      .exec();

    if (orders.length === 0) throw new Error('Orders Not Found');

    res.status(200).send(
      orders.map((order) => {
        return {
          orderId: order?._id,
          products: order?.products.map((product) => {
            return {
              productId: product?.productId?._id,
              title: product?.productId?.title,
              images: product?.productId?.images,
              quantity: product?.quantity,
              color: product?.color,
              price: product?.price,
            };
          }),
          totalQuantity: order?.totalQuantity,
          totalPrice: order?.totalPrice,
          totalPayablePrice: order?.totalPayablePrice,
          orderStatus: order?.orderStatus,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = req.cart;

    const order = new Order({
      products: cart?.products,
      orderBy: userId,
      totalQuantity: cart?.totalQuantity,
      totalPrice: cart?.totalPrice,
      totalPayablePrice: cart?.totalPayablePrice,
      orderCode: uniqid(),
      orderStatus: 'Not Processed',
    });

    await order.save();

    // Updating the sold & quantity fields for products in shopping cart
    let update = cart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.productId._id },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      };
    });

    await Product.bulkWrite(update, {});

    req.order = order;

    logMiddleware('createOrder');
    next();
  } catch (error) {
    next(error);
  }
};

const deleteOrder = asynchandler(async (req, res, next) => {
  try {
    const { orderId } = req.params;
    isObjectIdValid(orderId);

    const deletedOrder = await Order.findByIdAndUpdate(
      orderId,
      { softDelete: true },
      { new: true }
    );

    if (!deletedOrder) throw new Error('Order Not Found!');

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const updateOrderStatus = asynchandler(async (req, res, next) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    isObjectIdValid(orderId);

    const updateOrderStatus = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!updateOrderStatus) throw new Error('Order Not Found');

    req.order = updateOrderStatus;
    logMiddleware('updateOrderStatus');
    next();
  } catch (error) {
    next(error);
  }
});

const formatOrder = asynchandler(async (req, res, next) => {
  try {
    const order = req.order;
    const userId = req.user._id;

    const populatedOrder = await order.populate('products.productId', 'title _id images');

    req.order = {
      orderId: order?._id,
      products: populatedOrder?.products?.map((product) => {
        return {
          productId: product?.productId._id,
          title: product?.productId.title,
          images: product?.productId.images,
          quantity: product?.quantity,
          color: product?.color,
          price: product?.price,
        };
      }),
      orderBy: userId,
      totalQuantity: populatedOrder?.totalQuantity,
      totalPrice: populatedOrder?.totalPrice,
      totalPayablePrice: populatedOrder?.totalPayablePrice,
      orderCode: uniqid(),
      orderStatus: populatedOrder.orderStatus,
    };

    logMiddleware('formatOrder');
    next();
  } catch (error) {
    next(error);
  }
});

const sendOrder = asynchandler(async (req, res, next) => {
  try {
    const order = req.order;

    res.status(200).send(order);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createOrder,
  getAllOrdersByUserId,
  getOrder,
  deleteOrder,
  updateOrderStatus,
  formatOrder,
  sendOrder,
};
