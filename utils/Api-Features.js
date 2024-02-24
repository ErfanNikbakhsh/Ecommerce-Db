const mongoose = require('mongoose');
const sharp = require('sharp');
const fse = require('fs-extra');
const { createHash } = require('node:crypto');
const ObjectId = mongoose.Types.ObjectId;

const logMiddleware = (name) => {
  console.log(String.fromCodePoint(0x2714) + '  ' + name);
  return;
};

const isObjectIdValid = (id) => {
  if (!typeof id === Object) {
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

module.exports = { logMiddleware, isObjectIdValid, hashToken, resizeAndSaveImage };
