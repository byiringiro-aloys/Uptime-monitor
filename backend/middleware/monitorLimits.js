import Monitor from '../models/Monitor.js';
import logger from '../utils/logger.js';

// Middleware to check if user has reached monitor limit
export const checkMonitorLimit = async (req, res, next) => {
  try {
    const MAX_MONITORS_PER_USER = parseInt(process.env.MAX_MONITORS_PER_USER || '50', 10);
    
    const monitorCount = await Monitor.countDocuments({
      userId: req.user._id,
      isActive: true
    });

    if (monitorCount >= MAX_MONITORS_PER_USER) {
      logger.warn(`User ${req.user._id} reached monitor limit: ${monitorCount}/${MAX_MONITORS_PER_USER}`);
      return res.status(403).json({
        error: 'Monitor limit reached',
        message: `You have reached the maximum limit of ${MAX_MONITORS_PER_USER} monitors. Please delete some monitors before creating new ones.`,
        currentCount: monitorCount,
        maxLimit: MAX_MONITORS_PER_USER
      });
    }

    next();
  } catch (error) {
    logger.error('Error checking monitor limit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
