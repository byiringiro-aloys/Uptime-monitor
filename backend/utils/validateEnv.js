import logger from './logger.js';

const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

const validateEnv = () => {
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long in production');
    process.exit(1);
  }

  // Validate MongoDB URI format
  if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    logger.error('Invalid MONGODB_URI format');
    process.exit(1);
  }

  logger.info('Environment variables validated successfully');
};

export default validateEnv;
