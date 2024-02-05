const mongoose = require('mongoose');
const { createHash } = require('node:crypto');
const ObjectId = mongoose.Types.ObjectId;

const logMiddleware = (name) => {
  console.log(String.fromCodePoint(0x2714) + '  ' + name);
  return;
};

const isObjectIdValid = (id) => {
  const isValid = ObjectId.isValid(id) && String(new ObjectId(id)) === id;
  if (!isValid) throw new Error('Id Is Not Valid');
};

const hashToken = (token) => {
  return createHash('sha256').update(token).digest('hex');
};

module.exports = { logMiddleware, isObjectIdValid, hashToken };
