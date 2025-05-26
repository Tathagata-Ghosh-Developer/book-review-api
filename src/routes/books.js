const express = require('express');
const Book = require('../models/Book');
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateQuery, bookSchema, paginationSchema } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/books
// @desc    Add a new book
// @access  Private
router.post('/', authenticateToken, validate(bookSchema), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      createdBy: req.user._id
    };

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: { book }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while adding book'
    });
  }
});

// @route   GET /api/books
// @desc    Get all books with pagination and filters
// @access  Public
router.get('/', validateQuery(paginationSchema), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      author,
      genre,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }
    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username')
      .lean();

    // Get total count for pagination
    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBooks: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books'
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get book details by ID with reviews
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get book details
    const book = await Book.findById(req.params.id)
      .populate('createdBy', 'username')
      .lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get reviews with pagination
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ book: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username')
      .lean();

    const totalReviews = await Review.countDocuments({ book: req.params.id });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        book,
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
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book details'
    });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private (only book creator or admin)
router.put('/:id', authenticateToken, validate(bookSchema), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the creator or admin
    if (book.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this book'
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book: updatedBook }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating book'
    });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private (only book creator or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the creator or admin
    if (book.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this book'
      });
    }

    // Delete all reviews for this book
    await Review.deleteMany({ book: req.params.id });

    // Delete the book
    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting book'
    });
  }
});

module.exports = router;