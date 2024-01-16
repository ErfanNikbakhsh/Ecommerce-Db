const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '3 days' });
};

module.exports = generateToken;
