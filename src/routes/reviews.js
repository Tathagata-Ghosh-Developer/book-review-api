const express = require('express');
const Review = require('../models/Review');
const Book = require('../models/Book');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateQuery, reviewSchema, paginationSchema } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Add a review to a book
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log(req);
    const { bookId, rating, comment } = req.body;
    console.log(req.user._id);

    // Check if the book exists
    const book = await Book.findById(bookId);
    console.log(book);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if the user already reviewed the book
    const existingReview = await Review.findOne({ book: bookId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    const review = new Review({
      book: bookId,
      user: req.user._id,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'+ error.message
    });
  }
});

// @route   GET /api/reviews/:bookId
// @desc    Get reviews for a book
// @access  Public
router.get('/:bookId', validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const reviews = await Review.find({ book: req.params.bookId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username')
      .lean();

    const totalReviews = await Review.countDocuments({ book: req.params.bookId });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReviews,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (only review owner)
router.put('/:id', authenticateToken, validate(reviewSchema), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (only review owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
});

module.exports = router;
