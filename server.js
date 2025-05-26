const app = require('./src/app');
const logger = require('./src/utils/logger');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Connect to Database
// connectDB();

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;