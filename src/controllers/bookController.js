const bookService = require('../services/bookService');
const logger = require('../utils/logger');

class BookController {
  /**
   * Create a new book
   */
  async createBook(req, res, next) {
    try {
      const book = await bookService.createBook(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all books with optional filters and pagination
   */
  async getBooks(req, res, next) {
    try {
      const result = await bookService.getBooks(req.query);
      
      res.status(200).json({
        success: true,
        message: 'Books retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get book by ID with reviews
   */
  async getBookById(req, res, next) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      
      const result = await bookService.getBookById(id, { page, limit });
      
      res.status(200).json({
        success: true,
        message: 'Book retrieved successfully',
        data: result
      });
    } catch (error) {
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Search books by title or author
   */
  async searchBooks(req, res, next) {
    try {
      const result = await bookService.searchBooks(req.query);
      
      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();