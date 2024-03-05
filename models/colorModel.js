const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;
