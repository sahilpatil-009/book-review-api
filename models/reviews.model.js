const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Ensure one review per user per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

// update book's average rating after every review operation
ReviewSchema.post("save", async function () {
  await updateBookRating(this.book);
});

ReviewSchema.post("remove", async function () {
  await updateBookRating(this.book);
});

ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateBookRating(doc.book);
  }
});

async function updateBookRating(bookId) {
  const Book = mongoose.model("Book");
  const Review = mongoose.model("Review");

  const result = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: "$book",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
}

module.exports = mongoose.model('Review', ReviewSchema);
