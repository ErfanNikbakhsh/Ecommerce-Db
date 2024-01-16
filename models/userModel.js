const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    addresses: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Address',
      },
    ],
    cart: {
      type: Array,
      default: [],
    },
    wishlist: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    role: {
      type: String,
      default: 'user',
    },
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
  const saltRounds = 10;

  user.password = await bcrypt.hash(user.password, saltRounds);
});

userSchema.methods.isPasswordMatched = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};

const user = mongoose.model('User', userSchema);

module.exports = user;
