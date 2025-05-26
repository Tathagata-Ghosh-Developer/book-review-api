const Review = require('../models/Review');
const Book = require('../models/Book');
const logger = require('../utils/logger');

class ReviewService {
  /**
   * Create a new review
   * @param {string} bookId - Book ID
   * @param {Object} reviewData - Review data
   * @param {string} userId - User ID
   * @returns {Object} Created review
   */
  async createReview(bookId, reviewData, userId) {
    try {
      // Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      // Check if user already reviewed this book
      const existingReview = await Review.findOne({ book: bookId, user: userId });
      if (existingReview) {
        throw new Error('You have already reviewed this book');
      }

      // Create review
      const review = new Review({
        book: bookId,
        user: userId,
        ...reviewData
      });

      await review.save();
      await review.populate('user', 'username');

      logger.info(`New review created for book ${bookId} by user ${userId}`);
      
      return review;
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  }

  /**
   * Update user's own review
   * @param {string} reviewId - Review ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID
   * @returns {Object} Updated review
   */
  async updateReview(reviewId, updateData, userId) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      if (!review) {
        throw new Error('Review not found or you are not authorized to update it');
      }

      // Update review
      Object.assign(review, updateData);
      await review.save();
      await review.populate('user', 'username');

      logger.info(`Review ${reviewId} updated by user ${userId}`);
      
      return review;
    } catch (error) {
      logger.error('Update review error:', error);
      throw error;
    }
  }

  /**
   * Delete user's own review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      if (!review) {
        throw new Error('Review not found or you are not authorized to delete it');
      }

      await review.remove();
      logger.info(`Review ${reviewId} deleted by user ${userId}`);
      
      return true;
    } catch (error) {
      logger.error('Delete review error:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   * @param {string} reviewId - Review ID
   * @returns {Object} Review
   */
  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate('user', 'username')
        .populate('book', 'title author');
      
      if (!review) {
        throw new Error('Review not found');
      }

      return review;
    } catch (error) {
      logger.error('Get review by ID error:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();