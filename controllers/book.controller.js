const User = require("../models/user.model.js");
const Books = require("../models/books.model.js");
const Review = require("../models/reviews.model.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const GetAllbooks = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // filtering
    const filter = {};
    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: "i" };
    }
    if (req.query.genre) {
      filter.genre = { $regex: req.query.genre, $options: "i" };
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const books = await Books.find(filter)
      .populate("addedBy", "firstname lastname email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Books.countDocuments(filter);

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const AddBook = async (req, res) => {
  try {
    const book = new Books({
      ...req.body,
      addedBy: req.user._id,
    });

    await book.save();
    await book.populate("addedBy", "firstname lastname email");

    res.status(201).json({
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const GetbookDetails = async (req, res) => {
  try {
    // Fetch book with user info
    const book = await Books.findById(req.params.id).populate(
      "addedBy",
      "firstname lastname email"
    );
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Pagination for reviews
    const page = parseInt(req.query.reviewPage) || 1;
    const limit = parseInt(req.query.reviewLimit) || 5;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ book: req.params.id })
      .populate("user", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ book: req.params.id });

    res.json({
      book,
      reviews,
      reviewPagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const AddBookReview = async (req, res) => {
  try {
    const book = await Books.findById(req.params.id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not Found !" });
    }

    // check if user already review this book
    const existingReview = await Review.findOne({
      book: req.params.id,
      user: req.user._id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book" });
    }

    const { rating, comment } = req.body;
    const review = new Review({
      book: req.params.id,
      user: req.user._id,
      rating,
      comment,
    });

    await review.save();
    await review.populate("user", "firstname lastname email");

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const EditBookReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update your own reviews" });
    }

    Object.assign(review, req.body);
    await review.save();
    await review.populate("user", "firstname lastname email");

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const DeleteOwnReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const SearchBook = async (req,res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ],
    };

    const totalBooks = await Books.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalBooks / limit);

    const books = await Books.find(searchFilter)
      .populate("addedBy", "firstname lastname email")
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      query,
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

module.exports = {
  GetAllbooks,
  AddBook,
  GetbookDetails,
  AddBookReview,
  EditBookReview,
  DeleteOwnReview,
  SearchBook,
};
