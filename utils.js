const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const logMiddleware = (name) => {
  console.log(String.fromCodePoint(0x2714) + '  ' + name);
  return;
};

const isObjectIdValid = (id) => {
  const isValid = ObjectId.isValid(id) && String(new ObjectId(id)) === id;
  if (!isValid) throw new Error('Id Is Not Valid');
};

module.exports = { logMiddleware, isObjectIdValid };
