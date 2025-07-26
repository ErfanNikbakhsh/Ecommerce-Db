const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const sharp = require('sharp');
const fse = require('fs-extra');
const { createHash } = require('node:crypto');
const schedule = require('node-schedule');
const ObjectId = mongoose.Types.ObjectId;

const logMiddleware = (name) => {
  console.log(String.fromCodePoint(0x2714) + '  ' + name);
  return;
};

const isObjectIdValid = (id) => {
  if (typeof id !== 'object' && id) {
    const isValid = ObjectId.isValid(id) && String(new ObjectId(id)) === id;
    if (!isValid) throw new Error('Id Is Not Valid');
  }
};

const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

const resizeAndSaveImage = async (files, outputFolder) => {
  if (!files) return;

  const resizedFilesPath = await Promise.all(
    files.map(async (file) => {
      const outputPath = `public/images/${outputFolder}/${file.filename}`;

      await sharp(file.path)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      // Delete the original file after successful resize
      await fse.remove(file.path);

      return outputPath;
    })
  );

  return resizedFilesPath;
};

const requestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each user to 5 request attempts per day
  message: 'Too many attempts from this user, please try again later.',
  keyGenerator: (req, res) => req.path,
  // handler: (req, res, next, options) => res.status(options.statusCode).send(options.message),
});

const calculateTotalPrice = (products) => {
  const totalPrice =
    Math.round(products.reduce((acc, product) => acc + product.price * product.quantity, 0) * 100) /
    100;

  return totalPrice;
};

module.exports = {
  logMiddleware,
  isObjectIdValid,
  hashToken,
  resizeAndSaveImage,
  requestLimiter,
  calculateTotalPrice,
};
