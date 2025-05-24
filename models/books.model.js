const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    publishedYear: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear() + 10,
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    pages: {
      type: Number,
      min: 1,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Indexed
BookSchema.index({ title: 'text', author: 'text'});
BookSchema.index({ author: 1});
BookSchema.index({ genre: 1});
BookSchema.index({ averageRating: -1});

module.exports = mongoose.model('Book', BookSchema);