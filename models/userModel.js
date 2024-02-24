const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { randomBytes } = require('node:crypto');
const { hashToken } = require('../utils/Api-Features');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    addresses: {
      type: String,
    },
    cart: {
      type: Array,
      default: [],
    },
    wishlist: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
      },
    ],
    role: {
      type: String,
      default: 'user',
    },
    refreshToken: [String],
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  const user = this;
  if (user.isNew || user.isModified('password')) {
    const saltRounds = +process.env.BCRYPT_SALT;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

userSchema.methods.isPasswordMatched = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};

userSchema.methods.genResetToken = function () {
  const resetToken = randomBytes(32).toString('hex');

  this.passwordResetToken = hashToken(resetToken);
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const user = mongoose.model('User', userSchema);

module.exports = user;
