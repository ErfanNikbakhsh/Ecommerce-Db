const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '30m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REF_SECRET_KEY, { expiresIn: '2h' });
};

module.exports = { generateToken, generateRefreshToken };
