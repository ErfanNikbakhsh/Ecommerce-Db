const generateToken = require('../config/jwtToken');
const User = require('../models/userModel');
const asynchandler = require('express-async-handler');

const createUser = asynchandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Create a new User
    const newUser = await User.create(req.body);
    res.json({
      status: 'success',
      user: newUser,
    });
  } else {
    throw new Error('User already exists');
  }
});

const userLogin = asynchandler(async (req, res, next) => {
  const { password, email } = req.body;

  //Check User Existance
  const user = await User.findOne({ email });
  const isMatched = await user.isPasswordMatched(password);

  if (user && isMatched) {
    res.json({
      id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      mobile: user?.mobile,
      token: generateToken(user?._id),
    });
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
  } catch (error) {
    throw new Error(error);
  }
});

const getUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, softDelete: false });
    if (user) {
      res.json({ user });
    } else {
      res.json('User Not Found');
    }
  } catch {
    throw new Error(error);
  }
});

const updateUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
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
  } catch {
    throw new Error(error);
  }
});

const deleteUser = asynchandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, { softDelete: true }, { new: true });
    if (user) {
      res.json({
        id: user?._id,
        message: 'User Deleted Successfully',
      });
    } else {
      res.json('User Not Found');
    }
  } catch {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  userLogin,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
