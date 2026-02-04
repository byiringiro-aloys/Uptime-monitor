import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      heartbeatFrequencyMS: 10000, // How often to check server availability
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`📦 MongoDB Connected: ${conn.connection.host}`);
      logger.info(`📦 Database: ${conn.connection.name}`);
    }
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📦 MongoDB connection established');
  }
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB error:', error);
});

mongoose.connection.on('reconnected', () => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📦 MongoDB reconnected');
  }
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (process.env.NODE_ENV !== 'production') {
    logger.info('📦 MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default connectDB;
