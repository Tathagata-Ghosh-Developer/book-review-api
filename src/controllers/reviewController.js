const reviewService = require('../services/reviewService');
const logger = require('../utils/logger');

class ReviewController {
  /**
   * Create a new review for a book
   */
  async createReview(req, res, next) {
    try {
      const { id: bookId } = req.params;
      const review = await reviewService.createReview(bookId, req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'You have already reviewed this book') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Update user's own review
   */
  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const review = await reviewService.updateReview(id, req.body, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      if (error.message.includes('not found or you are not authorized')) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or unauthorized'
        });
      }
      next(error);
    }
  }

  /**
   * Delete user's own review
   */
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      await reviewService.deleteReview(id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('not found or you are not authorized')) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or unauthorized'
        });
      }
      next(error);
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(req, res, next) {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);
      
      res.status(200).json({
        success: true,
        message: 'Review retrieved successfully',
        data: review
      });
    } catch (error) {
      if (error.message === 'Review not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new ReviewController();