const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asynchandler = require('express-async-handler');
const { logMiddleware } = require('../utils');
const { generateRefreshToken, generateToken } = require('../config/jwtToken');

const auth = asynchandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId).exec();
        req.user = user;
        logMiddleware('auth');
        next();
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token Expired. Please Login Again.' });
      } else {
        return res.status(401).json({ message: 'Not Authorized, Please Login Again' });
      }
    }
  } else {
    throw new Error('There Is No Token Attached!');
  }
});

const refreshToken = asynchandler(async (req, res, next) => {
  const enteredRefreshToken = req.cookies.refreshToken;

  if (enteredRefreshToken) {
    try {
      const user = await User.findOne({ refreshToken: enteredRefreshToken }).lean().exec();

      // Detected refresh token reuse!
      if (!user) {
        const decoded = jwt.verify(enteredRefreshToken, process.env.REF_SECRET_KEY);

        // Find the hackedUser and delete all refresh tokens
        await User.findByIdAndUpdate(decoded?.userId, { refreshToken: [] });
        res.status(403).json({ message: 'Access denied, Please login again!' });
      }

      // Remove the used refresh token and update DB
      const newRefTokenArray = user.refreshToken.filter((rt) => rt !== enteredRefreshToken);
      user.refreshToken = newRefTokenArray;
      await user.save();

      // Evaluate refresh token
      jwt.verify(enteredRefreshToken, process.env.REF_SECRET_KEY);

      // Generate the new tokens and add RF to the Db
      const newAccessToken = generateToken(user._id);
      const newRefToken = generateRefreshToken(user._id);
      user.refreshToken.push(newRefToken);
      await user.save();

      res.status(200).json({
        access: newAccessToken,
        refresh: newRefToken,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Refresh Token Expired. Please Login Again.' });
      } else {
        next(error);
      }
    }
  } else {
    throw new Error('There Is No Refresh Token Attached!');
  }
});

const isAdmin = asynchandler(async (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    throw new Error('you are not an admin');
  } else {
    logMiddleware('isAdmin');
    next();
  }
});

module.exports = { auth, isAdmin, refreshToken };
