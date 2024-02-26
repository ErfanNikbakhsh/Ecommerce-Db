const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'blogCategory',
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
    isDisliked: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    disLikes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    images: [
      {
        publicId: String,
        url: String,
      },
    ],
    author: {
      type: String,
      default: 'admin',
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
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// blogSchema.virtual('isLiked').get(function () {});

// blogSchema.virtual('isDisliked').get(function () {});

// blogSchema.virtual('totalLikes').get(function () {
//   return this.likes.length;
// });

// blogSchema.virtual('totalDislikes').get(function () {
//   return this.disLikes.length;
// });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
