const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
const userSignupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const bookSchema = Joi.object({
  title: Joi.string().max(200).required(),
  author: Joi.string().max(100).required(),
  genre: Joi.string().max(50).required(),
  description: Joi.string().max(2000).required(),
  publishedDate: Joi.date().required(),
  isbn: Joi.string().pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/).optional(),
  pageCount: Joi.number().min(1).optional(),
  language: Joi.string().optional()
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).required()
});

const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10),
  author: Joi.string().optional(),
  genre: Joi.string().optional(),
  sortBy: Joi.string().valid('createdAt', 'averageRating', 'title', 'author').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).required(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(10)
});

module.exports = {
  validate,
  validateQuery,
  userSignupSchema,
  userLoginSchema,
  bookSchema,
  reviewSchema,
  paginationSchema,
  searchSchema
};