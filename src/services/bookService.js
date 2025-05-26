const Book = require('../models/Book');
const Review = require('../models/Review');
const logger = require('../utils/logger');

class BookService {
  /**
   * Create a new book
   * @param {Object} bookData - Book data
   * @param {string} userId - ID of user creating the book
   * @returns {Object} Created book
   */
  async createBook(bookData, userId) {
    try {
      const book = new Book({
        ...bookData,
        createdBy: userId
      });

      await book.save();
      logger.info(`New book created: ${book.title} by user ${userId}`);
      
      return book;
    } catch (error) {
      logger.error('Create book error:', error);
      throw error;
    }
  }

  /**
   * Get all books with pagination and filters
   * @param {Object} filters - Filter options
   * @returns {Object} Books with pagination info
   */
  async getBooks(filters = {}) {
    try {
      const { page = 1, limit = 10, author, genre } = filters;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (author) {
        query.author = new RegExp(author, 'i');
      }
      if (genre) {
        query.genre = genre;
      }

      // Execute query with pagination
      const [books, total] = await Promise.all([
        Book.find(query)
          .populate('createdBy', 'username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Book.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        books,
        pagination: {
          currentPage: page,
          totalPages,
          totalBooks: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Get books error:', error);
      throw error;
    }
  }

  /**
   * Get book by ID with reviews
   * @param {string} bookId - Book ID
   * @param {Object} reviewPagination - Review pagination options
   * @returns {Object} Book with reviews
   */
  async getBookById(bookId, reviewPagination = {}) {
    try {
      const { page = 1, limit = 10 } = reviewPagination;
      const skip = (page - 1) * limit;

      // Get book details
      const book = await Book.findById(bookId).populate('createdBy', 'username');
      if (!book) {
        throw new Error('Book not found');
      }

      // Get reviews with pagination
      const [reviews, totalReviews] = await Promise.all([
        Review.find({ book: bookId })
          .populate('user', 'username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Review.countDocuments({ book: bookId })
      ]);

      const totalPages = Math.ceil(totalReviews / limit);

      return {
        book,
        reviews,
        reviewPagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Get book by ID error:', error);
      throw error;
    }
  }

  /**
   * Search books by title or author
   * @param {Object} searchParams - Search parameters
   * @returns {Object} Search results with pagination
   */
  async searchBooks(searchParams) {
    try {
      const { q, page = 1, limit = 10 } = searchParams;
      const skip = (page - 1) * limit;

      // Create text search query
      const searchQuery = {
        $or: [
          { title: new RegExp(q, 'i') },
          { author: new RegExp(q, 'i') }
        ]
      };

      // Execute search with pagination
      const [books, total] = await Promise.all([
        Book.find(searchQuery)
          .populate('createdBy', 'username')
          .sort({ averageRating: -1, reviewCount: -1 })
          .skip(skip)
          .limit(limit),
        Book.countDocuments(searchQuery)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        books,
        searchQuery: q,
        pagination: {
          currentPage: page,
          totalPages,
          totalBooks: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Search books error:', error);
      throw error;
    }
  }
}

module.exports = new BookService();