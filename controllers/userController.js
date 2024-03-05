const { generateToken, generateRefreshToken } = require('../config/jwtToken');
const { logMiddleware, isObjectIdValid, hashToken } = require('../utils/Api-Features');
const User = require('../models/userModel');
const asynchandler = require('express-async-handler');
const schedule = require('node-schedule');
const jwt = require('jsonwebtoken');

const createUser = asynchandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).exec();

  if (!user) {
    // Create a new User
    const newUser = await User.create(req.body);
    const refreshToken = generateRefreshToken(newUser?._id);
    const refreshTokenExp = jwt.verify(refreshToken, process.env.REF_SECRET_KEY).exp * 1000; // review for improvement(made this field for daily expired refresh token clean-up)
    const hashedRefToken = hashToken(refreshToken);

    newUser.refreshTokens.push({ token: hashedRefToken, expiresAt: refreshTokenExp });
    await newUser.save();

    res.json({
      id: newUser?._id,
      firstName: newUser?.firstName,
      lastName: newUser?.lastName,
      email: newUser?.email,
      mobile: newUser?.mobile,
      access: generateToken(newUser?._id),
      refresh: refreshToken,
    });
  } else {
    throw new Error('User already exists');
  }
});

const userLogin = asynchandler(async (req, res, next) => {
  const { password, email } = req.body;

  //Check User Existence
  const user = await User.findOne({ email }).exec();

  if (user && (await user.isPasswordMatched(password))) {
    const refreshToken = generateRefreshToken(user?._id);
    const refreshTokenExp = jwt.verify(refreshToken, process.env.REF_SECRET_KEY).exp * 1000;
    const hashedRefToken = hashToken(refreshToken);

    user.refreshTokens.push({ token: hashedRefToken, expiresAt: refreshTokenExp });
    await user.save();

    res.json({
      id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      mobile: user?.mobile,
      access: generateToken(user?._id),
      refresh: refreshToken,
    });
  } else {
    throw new Error('Invalid Credentials');
  }
});

const adminLogin = asynchandler(async (req, res, next) => {
  const { password, email } = req.body;

  //Check admin Existence
  const admin = await User.findOne({ email }).exec();

  if (admin.role !== 'admin') throw new Error('Not Authorized');

  if (admin && (await admin.isPasswordMatched(password))) {
    const refreshToken = generateRefreshToken(admin?._id);
    const refreshTokenExp = jwt.verify(refreshToken, process.env.REF_SECRET_KEY).exp * 1000;
    const hashedRefToken = hashToken(refreshToken);

    admin.refreshTokens.push({ token: hashedRefToken, expiresAt: refreshTokenExp });
    await admin.save();

    res.json({
      id: admin?._id,
      firstName: admin?.firstName,
      lastName: admin?.lastName,
      email: admin?.email,
      mobile: admin?.mobile,
      access: generateToken(admin?._id),
      refresh: refreshToken,
    });
  } else {
    throw new Error('Invalid Credentials');
  }
});

const userLogout = asynchandler(async (req, res, next) => {
  try {
    const loginUser = req.user;

    const enteredRefreshToken = req.cookies.refreshToken;
    if (!enteredRefreshToken) throw new Error('There Is No Refresh Token Attached!');
    const hashedRefToken = hashToken(enteredRefreshToken);

    const isRefreshValid = loginUser.refreshTokens.find((rf) => rf.token === hashedRefToken);

    if (isRefreshValid) {
      // Delete refresh token in DB
      const newRefTokenArray = loginUser.refreshTokens.filter((rt) => rt.token !== hashedRefToken);
      loginUser.refreshTokens = newRefTokenArray;

      await loginUser.save();

      return res.sendStatus(204);
    } else {
      const user = await User.findOne({ 'refreshTokens.token': hashedRefToken }).exec();

      loginUser.refreshTokens = [];
      user.refreshTokens = [];

      await loginUser.save();
      await user.save();
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

const getAllUsers = asynchandler(async (req, res, next) => {
  try {
    const users = await User.find({ softDelete: false }).populate('wishlist').exec();
    if (!users.length) {
      res.json('Users Not Found');
    }

    req.users = users;

    logMiddleware('getAllUsers');
    next();
  } catch (error) {
    next(error);
  }
});

const getUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  isObjectIdValid(id);

  try {
    const user = await User.findOne({ _id: id, softDelete: false }).populate('wishlist').exec();

    if (!user) throw new Error('User Not Found');

    req.user = user;

    logMiddleware('getUser');
    next();
  } catch {
    next(error);
  }
});

const updateUser = asynchandler(async (req, res, next) => {
  const id = req.user._id;

  try {
    const updatedUser = await User.findOneAndUpdate({ _id: id, softDelete: false }, req.body, {
      new: true,
    }).populate('wishlist');

    if (!updateUser) throw new Error('User Not Found');

    req.user = updatedUser;

    logMiddleware('updateUser');
    next();
  } catch (err) {
    next(err);
  }
});

const deleteUser = asynchandler(async (req, res, next) => {
  const id = req.user._id;

  try {
    const user = await User.findByIdAndUpdate(id, { softDelete: true }, { new: true });
    if (user) {
      res.json({
        id: user._id,
        message: 'User Deleted Successfully',
      });
    } else {
      res.json('User Not Found');
    }
    logMiddleware('deleteUser');
  } catch {
    next(error);
  }
});

const blockUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  isObjectIdValid(id);

  try {
    const blockedUser = await User.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (blockedUser) {
      res.json({
        id: blockedUser._id,
        message: 'User Blocked Successfully',
      });
    } else {
      throw new Error('User Not Found');
    }
  } catch (err) {
    next(err);
  }
});

const unBlockUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  isObjectIdValid(id);

  try {
    const unBlockedUser = await User.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    if (unBlockedUser) {
      res.json({
        id: unBlockedUser._id,
        message: 'User UnBlocked Successfully',
      });
    } else {
      throw new Error('User Not Found');
    }
  } catch (err) {
    next(err);
  }
});

const getWishlist = asynchandler(async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).populate('wishlist');

    if (!user) throw new Error('User Not Found!');

    res.send(
      user?.wishlist?.map((product) => {
        return {
          productId: product?._id,
          title: product?.title,
          description: product?.description,
          price: product?.price,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

const formatUser = asynchandler(async (req, res, next) => {
  try {
    const user = req.user;
    res.send({
      userId: user?._id,
      firstName: user?.firstName,
      lastName: user.lastName,
      email: user?.email,
      mobile: user?.mobile,
      addresses: user?.addresses,
      role: user?.role,
      wishlist: user?.wishlist?.map((product) => {
        return {
          productId: product?._id,
          title: product?.title,
          description: product?.description,
          price: product?.price,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

const formatUsers = asynchandler(async (req, res, next) => {
  try {
    const users = req.users;

    res.send(
      users.map((user) => {
        return {
          userId: user?._id,
          firstName: user?.firstName,
          lastName: user.lastName,
          email: user?.email,
          mobile: user?.mobile,
          addresses: user?.addresses,
          role: user?.role,
          wishlist: user?.wishlist?.map((product) => {
            return {
              productId: product?._id,
              title: product?.title,
              description: product?.description,
              price: product?.price,
            };
          }),
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

// Define a scheduled job to run daily
const cleanupJob = schedule.scheduleJob('0 0 * * *', async function () {
  try {
    // Find users with expired refresh tokens & Remove the expired refresh tokens
    const result = await User.updateMany(
      { 'refreshTokens.expiresAt': { $lt: new Date() } },
      { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
    );

    console.log('Refresh token cleanup completed successfully.');
  } catch (error) {
    console.error('Error during refresh token cleanup:', error);
  }
});

module.exports = {
  createUser,
  userLogin,
  adminLogin,
  userLogout,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unBlockUser,
  getWishlist,
  formatUser,
  formatUsers,
};
