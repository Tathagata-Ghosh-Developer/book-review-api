const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * User signup
   */
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  /**
   * User login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();