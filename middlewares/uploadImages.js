const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const asynchandler = require('express-async-handler');
const { logMiddleware, isObjectIdValid, resizeAndSaveImage } = require('../utils/Api-Features');

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
  },
});

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb({ message: 'unsupported file format' }, false);
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2097152 }, // 2 megabytes in bytes
}).array('images', 10);

const productImgResize = asynchandler(async (req, res, next) => {
  const resizedFilesPath = await resizeAndSaveImage(req.files, 'products');

  req.resizedFilesPath = resizedFilesPath;
  logMiddleware('productImgResize');
  next();
});

const blogImgResize = asynchandler(async (req, res, next) => {
  const resizedFilesPath = await resizeAndSaveImage(req.files, 'blogs');

  req.resizedFilesPath = resizedFilesPath;
  logMiddleware('blogImgResize');
  next();
});

module.exports = { uploadPhoto, productImgResize, blogImgResize };
