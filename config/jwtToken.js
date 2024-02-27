const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '1d' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REF_SECRET_KEY, { expiresIn: '3d' });
};

module.exports = { generateToken, generateRefreshToken };
