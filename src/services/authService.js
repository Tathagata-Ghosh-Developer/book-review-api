const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Generate JWT token for user
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User and token
   */
  async signup(userData) {
    try {
      const { username, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Create new user
      const user = new User({ username, email, password });
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      logger.info(`New user registered: ${user.email}`);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {Object} loginData - Login credentials
   * @returns {Object} User and token
   */
  async login(loginData) {
    try {
      const { email, password } = loginData;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user._id);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();