const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Index for better query performance
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Middleware to update book's average rating after save
reviewSchema.post('save', async function() {
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  if (book) {
    await book.calculateAverageRating();
  }
});

// Middleware to update book's average rating after remove
reviewSchema.post('remove', async function() {
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  if (book) {
    await book.calculateAverageRating();
  }
});

// Middleware to update book's average rating after findOneAndDelete
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Book = mongoose.model('Book');
    const book = await Book.findById(doc.book);
    if (book) {
      await book.calculateAverageRating();
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);