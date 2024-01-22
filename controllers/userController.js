const generateToken = require('../config/jwtToken');
const { logMiddleware, isObjectIdValid } = require('../utils');
const User = require('../models/userModel');
const asynchandler = require('express-async-handler');

const createUser = asynchandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Create a new User
    const newUser = await User.create(req.body);

    res.json({
      id: newUser?._id,
      firstName: newUser?.firstName,
      lastName: newUser?.lastName,
      email: newUser?.email,
      mobile: newUser?.mobile,
      token: generateToken(newUser?._id),
    });
    logMiddleware('createUser');
  } else {
    throw new Error('User already exists');
  }
});

const userLogin = asynchandler(async (req, res, next) => {
  const { password, email } = req.body;

  //Check User Existence
  const user = await User.findOne({ email });

  if (user && (await user.isPasswordMatched(password))) {
    res.json({
      id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      mobile: user?.mobile,
      token: generateToken(user?._id),
    });
    logMiddleware('userLogin');
  } else {
    throw new Error('Invalid Credentials');
  }
});

const getAllUsers = asynchandler(async (req, res, next) => {
  try {
    const users = await User.find({ softDelete: false });
    if (users.length) {
      res.json(users);
    } else {
      res.json('Users Not Found');
    }
    logMiddleware('getAllUsers');
  } catch (error) {
    throw new Error(error);
  }
});

const getUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  isObjectIdValid(id);

  try {
    const user = await User.findOne({ _id: id, softDelete: false });
    console.log(user);
    if (user) {
      res.json({ user });
    } else {
      res.json('User Not Found');
    }
    logMiddleware('getUser');
  } catch {
    throw new Error(error);
  }
});

const updateUser = asynchandler(async (req, res, next) => {
  const id = req.user._id;

  try {
    const updatedUser = await User.findOneAndUpdate({ _id: id, softDelete: false }, req.body, {
      new: true,
    });
    if (updatedUser) {
      res.json({
        user: updatedUser,
      });
    } else {
      res.json('User Not Found');
    }
    logMiddleware('updateUser');
  } catch (err) {
    throw new Error(err);
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
    throw new Error(error);
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
    throw new Error(err);
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
    throw new Error(err);
  }
});

module.exports = {
  createUser,
  userLogin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unBlockUser,
};
