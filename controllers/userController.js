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

module.exports = {
  createUser,
};
