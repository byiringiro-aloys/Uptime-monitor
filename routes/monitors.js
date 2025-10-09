import express from 'express';
import { body, validationResult } from 'express-validator';
import Monitor from '../models/Monitor.js';
import PingLog from '../models/PingLog.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all monitors for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const monitors = await Monitor.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({ monitors });
  } catch (error) {
    console.error('Get monitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific monitor with recent logs
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Get recent ping logs (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = await PingLog.find({
      monitorId: monitor._id,
      timestamp: { $gte: oneDayAgo }
    }).sort({ timestamp: -1 }).limit(100);

    res.json({ monitor, recentLogs });
  } catch (error) {
    console.error('Get monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new monitor
router.post('/', [
  authenticateToken,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid HTTP or HTTPS URL'),
  body('interval')
    .optional()
    .isInt({ min: 60000 })
    .withMessage('Interval must be at least 60000ms (1 minute)'),
  body('timeout')
    .optional()
    .isInt({ min: 1000, max: 60000 })
    .withMessage('Timeout must be between 1000ms and 60000ms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, url, interval, timeout } = req.body;

    // Check if user already has a monitor with this URL
    const existingMonitor = await Monitor.findOne({
      userId: req.user._id,
      url,
      isActive: true
    });

    if (existingMonitor) {
      return res.status(409).json({ error: 'You already have a monitor for this URL' });
    }

    const monitor = new Monitor({
      userId: req.user._id,
      name,
      url,
      interval: interval || 300000, // 5 minutes default
      timeout: timeout || 10000 // 10 seconds default
    });

    await monitor.save();

    res.status(201).json({
      message: 'Monitor created successfully',
      monitor
    });
  } catch (error) {
    console.error('Create monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update monitor
router.put('/:id', [
  authenticateToken,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('interval')
    .optional()
    .isInt({ min: 60000 })
    .withMessage('Interval must be at least 60000ms (1 minute)'),
  body('timeout')
    .optional()
    .isInt({ min: 1000, max: 60000 })
    .withMessage('Timeout must be between 1000ms and 60000ms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isActive: true },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    res.json({
      message: 'Monitor updated successfully',
      monitor
    });
  } catch (error) {
    console.error('Update monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete monitor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // First find the monitor to ensure it exists and belongs to the user
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Actually delete the monitor from the database
    await Monitor.findByIdAndDelete(req.params.id);

    // Also delete all associated ping logs
    await PingLog.deleteMany({ monitorId: req.params.id });

    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    console.error('Delete monitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monitor statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Calculate time range based on period
    let timeRange;
    switch (period) {
      case '1h':
        timeRange = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get ping logs for the period
    const logs = await PingLog.find({
      monitorId: monitor._id,
      timestamp: { $gte: timeRange }
    }).sort({ timestamp: 1 });

    // Calculate statistics
    const totalPings = logs.length;
    const successfulPings = logs.filter(log => log.status === 'success').length;
    const uptime = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0;
    
    const responseTimes = logs
      .filter(log => log.responseTime !== null)
      .map(log => log.responseTime);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Group logs by hour for chart data
    const hourlyData = {};
    logs.forEach(log => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
      if (!hourlyData[hour]) {
        hourlyData[hour] = { total: 0, successful: 0 };
      }
      hourlyData[hour].total++;
      if (log.status === 'success') {
        hourlyData[hour].successful++;
      }
    });

    const chartData = Object.entries(hourlyData).map(([hour, data]) => ({
      timestamp: hour,
      uptime: (data.successful / data.total) * 100,
      total: data.total
    }));

    res.json({
      stats: {
        uptime: Math.round(uptime * 100) / 100,
        totalPings,
        successfulPings,
        avgResponseTime: Math.round(avgResponseTime),
        period
      },
      chartData
    });
  } catch (error) {
    console.error('Get monitor stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
