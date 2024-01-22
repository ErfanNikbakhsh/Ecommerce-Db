const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asynchandler = require('express-async-handler');
const { logMiddleware } = require('../utils');
const dotenv = require('dotenv').config();

const auth = asynchandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId);
        req.user = user;
        logMiddleware('auth');
        next();
      }
    } catch {
      throw new Error('Not Authorized, Please Login Again');
    }
  } else {
    throw new Error('There Is No Token Attached!');
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

module.exports = { auth, isAdmin };
