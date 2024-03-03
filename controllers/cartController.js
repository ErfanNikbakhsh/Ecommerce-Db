const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid, calculateTotalPrice } = require('../utils/Api-Features');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const Product = require('../models/productModel');
const { isValidObjectId } = require('mongoose');

const addToCart = asynchandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user._id;
  const { colorId } = req.body;

  isValidObjectId(colorId);
  isValidObjectId(productId);

  try {
    let cart = await Cart.findOne({ user: userId }).exec();
    const product = await Product.findById(productId).exec();

    if (!product) throw new Error('Product Not Found');

    if (cart) {
      const existingProductIndex = cart.products.findIndex(
        (product) =>
          product.productId.toString() === productId && product.color.toString() === colorId
      );

      if (existingProductIndex > -1) {
        // Product already exists
        cart.products[existingProductIndex].quantity++;
        cart.totalPrice = calculateTotalPrice(cart.products);
        cart.totalQuantity++;
      } else {
        // New product, push to array
        cart.products.push({
          productId,
          color: colorId,
          price: product.price,
          addedAt: Date.now(),
        });
        cart.totalQuantity++;
        cart.totalPrice = calculateTotalPrice(cart.products);
      }

      const updatedCart = await cart.save();

      return res.status(200).send(updatedCart);
    } else {
      // Create a new cart with the product
      const newCart = await Cart.create({
        products: [
          {
            productId,
            color: colorId,
            price: product.price,
            addedAt: Date.now(),
          },
        ],
        user: userId,
        totalPrice: product.price,
      });

      return res.status(201).send(newCart);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const getCart = asynchandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
      'products.productId',
      'title categoryId price _id images updatedAt'
    );

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Check if any products might have changed since added to cart
    const productsToUpdate = cart.products.filter(
      (item) => item.productId.updatedAt > item.addedAt
    );

    // Fetch updated prices for products needing updates
    if (productsToUpdate.length > 0) {
      const updatedProducts = await Promise.all(
        productsToUpdate.map((item) => Product.findById(item.productId))
      );

      // Update prices for products needing updates
      productsToUpdate.forEach((item, index) => {
        item.price = updatedProducts[index].price;
      });

      // Update the totalPrice of the shopping cart
      cart.totalPrice = calculateTotalPrice(cart.products);
      await cart.save();
    }

    req.cart = cart;

    logMiddleware('getCart');
    next();
  } catch (error) {
    next(error);
  }
});

const updateCart = asynchandler(async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { colorId } = req.body;
    const userId = req.user._id;

    isValidObjectId(colorId);
    isValidObjectId(productId);

    const cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);

    if (!product || !colorId) throw new Error('Product or color Not Found');

    if (!cart) throw new Error('Cart Not Found');

    const productIndex = cart.products.findIndex(
      (product) =>
        product.productId.toString() === productId && product.color.toString() === colorId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity--;
      cart.totalPrice = calculateTotalPrice(cart.products);
      cart.totalQuantity--;
    } else {
      throw new Error('There is no product with the given colorId & productId in cart');
    }

    await cart.save();

    res.send(cart);
  } catch (error) {
    next(error);
  }
});

const removeItemFromCart = asynchandler(async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { colorId } = req.body;
    const userId = req.user._id;

    isValidObjectId(colorId);
    isValidObjectId(productId);

    const cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);

    if (!product || !colorId) throw new Error('Product or color Not Found');

    if (!cart) throw new Error('Cart Not Found');

    const productIndex = cart.products.findIndex(
      (product) =>
        product.productId.toString() === productId && product.color.toString() === colorId
    );

    if (productIndex > -1) {
      cart.totalQuantity -= cart.products[productIndex].quantity;
      cart.products.splice(productIndex, 1);
      cart.totalPrice = calculateTotalPrice(cart.products);
    } else {
      throw new Error('There is no product with the given colorId & productId in cart');
    }

    await cart.save();

    res.send(cart);
  } catch (error) {
    next(error);
  }
});

const clearCart = asynchandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const deletedCart = await Cart.findOneAndDelete({ user: userId }).exec();

    if (!deletedCart) throw new Error('Cart Not Found');

    logMiddleware('clearCart');
    next();
  } catch (error) {
    next(error);
  }
});

const validateCoupon = asynchandler(async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    const cart = req.cart;

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) throw new Error('Coupon not found');

    // Check if the coupon is expired
    if (coupon.expiry < new Date()) throw new Error('Coupon has expired!');

    // Check if the cart total meets the minimum cart amount
    if (cart.totalPrice < coupon.minOrderAmount) {
      throw new Error('Order total does not meet the minimum requirement');
    }

    if (coupon.currentUsage >= coupon.usageLimit) {
      throw new Error('Coupon has reached its maximum usage limit');
    }

    req.coupon = coupon;
    logMiddleware('validateCoupon');
    next();
  } catch (error) {
    next(error);
  }
});

const updatePrice = asynchandler(async (req, res, next) => {
  try {
    const coupon = req.coupon;
    const cart = req.cart;

    // Apply discount based on the discount type
    let discountedValue;

    switch (coupon.discountType) {
      case 'percentage':
        discountedValue = (cart.totalPrice * coupon.discountAmount) / 100;
        break;
      case 'fixed':
        discountedValue = coupon.discountAmount;
        break;
      default:
        return res.status(400).json({ error: 'Invalid discount type' });
    }

    cart.totalPayablePrice = cart.totalPrice - discountedValue;

    await cart.save();

    // expire and increment the coupon currentUsage by one when the purchase was successful.

    res.send(cart);
  } catch (error) {
    next(error);
  }
});

const sendCart = asynchandler(async (req, res, next) => {
  try {
    const cart = req.cart;

    res.send(cart);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  addToCart,
  getCart,
  removeItemFromCart,
  updateCart,
  clearCart,
  validateCoupon,
  updatePrice,
  sendCart,
};
