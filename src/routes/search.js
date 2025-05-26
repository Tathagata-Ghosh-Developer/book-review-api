const express = require('express');
const Book = require('../models/Book');
const { validateQuery, searchSchema } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/search
// @desc    Search books by title or author
// @access  Public
router.get('/', validateQuery(searchSchema), async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Create search query for title and author (case-insensitive, partial match)
    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    };

    // Execute search
    const books = await Book.find(searchQuery)
      .sort({ averageRating: -1, createdAt: -1 }) // Sort by rating first, then by newest
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username')
      .lean();

    // Get total count
    const total = await Book.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        books,
        searchQuery: q,
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
      message: 'Server error while searching books'
    });
  }
});

// @route   GET /api/search/advanced
// @desc    Advanced search with multiple filters
// @access  Public
router.get('/advanced', async (req, res) => {
  try {
    const {
      title,
      author,
      genre,
      minRating,
      maxRating,
      language,
      page = 1,
      limit = 10,
      sortBy = 'averageRating',
      sortOrder = 'desc'
    } = req.query;

    // Build search query
    const searchQuery = {};

    if (title) {
      searchQuery.title = { $regex: title, $options: 'i' };
    }
    
    if (author) {
      searchQuery.author = { $regex: author, $options: 'i' };
    }
    
    if (genre) {
      searchQuery.genre = { $regex: genre, $options: 'i' };
    }
    
    if (language) {
      searchQuery.language = { $regex: language, $options: 'i' };
    }

    // Rating range filter
    if (minRating || maxRating) {
      searchQuery.averageRating = {};
      if (minRating) {
        searchQuery.averageRating.$gte = parseFloat(minRating);
      }
      if (maxRating) {
        searchQuery.averageRating.$lte = parseFloat(maxRating);
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute search
    const books = await Book.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username')
      .lean();

    // Get total count
    const total = await Book.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        books,
        searchCriteria: {
          title,
          author,
          genre,
          minRating,
          maxRating,
          language
        },
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
      message: 'Server error while performing advanced search'
    });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions based on partial input
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    // Get title and author suggestions
    const titleSuggestions = await Book.distinct('title', {
      title: { $regex: q, $options: 'i' }
    }).limit(5);

    const authorSuggestions = await Book.distinct('author', {
      author: { $regex: q, $options: 'i' }
    }).limit(5);

    const suggestions = [
      ...titleSuggestions.map(title => ({ type: 'title', value: title })),
      ...authorSuggestions.map(author => ({ type: 'author', value: author }))
    ].slice(0, 10); // Limit to 10 suggestions

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
});

module.exports = router;