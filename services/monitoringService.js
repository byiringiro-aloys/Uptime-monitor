import fetch from 'node-fetch';
import cron from 'node-cron';
import Monitor from '../models/Monitor.js';
import PingLog from '../models/PingLog.js';
import logger from '../utils/logger.js';

class MonitoringService {
  constructor() {
    this.activeMonitors = new Map();
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    
    logger.info('🚀 Starting monitoring service...');
    this.isRunning = true;

    // Schedule monitoring checks every minute
    cron.schedule('* * * * *', async () => {
      await this.checkAllMonitors();
    });

    // Initial check
    await this.checkAllMonitors();
  }

  async stop() {
    logger.info('⏹️ Stopping monitoring service...');
    this.isRunning = false;
    this.activeMonitors.clear();
  }

  async checkAllMonitors() {
    try {
      const monitors = await Monitor.find({ isActive: true });
      
      for (const monitor of monitors) {
        // Check if it's time to ping this monitor
        const now = Date.now();
        const lastChecked = monitor.lastChecked ? monitor.lastChecked.getTime() : 0;
        const timeSinceLastCheck = now - lastChecked;

        if (timeSinceLastCheck >= monitor.interval) {
          await this.checkMonitor(monitor);
        }
      }
    } catch (error) {
      logger.error('Error checking monitors:', error);
    }
  }

  async checkMonitor(monitor) {
    const startTime = Date.now();
    let pingLog = {
      monitorId: monitor._id,
      timestamp: new Date()
    };

    try {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`🔍 Checking ${monitor.name} (${monitor.url})`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), monitor.timeout);

      const response = await fetch(monitor.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Uptime-Monitor-Bot/1.0'
        }
      });

      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      const isSuccess = response.ok; // 2xx status codes

      pingLog = {
        ...pingLog,
        status: isSuccess ? 'success' : 'failure',
        responseTime,
        statusCode: response.status,
        errorMessage: isSuccess ? null : `HTTP ${response.status} ${response.statusText}`
      };

      // Update monitor status
      const updateData = {
        lastChecked: new Date(),
        status: isSuccess ? 'up' : 'down',
        totalChecks: monitor.totalChecks + 1,
        successfulChecks: isSuccess ? monitor.successfulChecks + 1 : monitor.successfulChecks
      };

      // Calculate uptime percentage
      updateData.uptime = (updateData.successfulChecks / updateData.totalChecks) * 100;

      await Monitor.findByIdAndUpdate(monitor._id, updateData);

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`${isSuccess ? '✅' : '❌'} ${monitor.name}: ${response.status} (${responseTime}ms)`);
      }
      
      // Log only failures in production
      if (!isSuccess && process.env.NODE_ENV === 'production') {
        logger.warn(`Monitor ${monitor.name} is down: ${response.status} (${responseTime}ms)`);
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      pingLog = {
        ...pingLog,
        status: 'failure',
        responseTime: responseTime < monitor.timeout ? responseTime : null,
        statusCode: null,
        errorMessage: error.message
      };

      // Update monitor status
      const updateData = {
        lastChecked: new Date(),
        status: 'down',
        totalChecks: monitor.totalChecks + 1,
        successfulChecks: monitor.successfulChecks
      };

      updateData.uptime = monitor.totalChecks > 0 
        ? (updateData.successfulChecks / updateData.totalChecks) * 100 
        : 0;

      await Monitor.findByIdAndUpdate(monitor._id, updateData);

      logger.warn(`❌ Monitor ${monitor.name} failed: ${error.message}`);
    }

    // Save ping log
    try {
      await new PingLog(pingLog).save();
    } catch (error) {
      logger.error('Error saving ping log:', error);
    }
  }

  async getMonitorSummary(monitorId, hours = 24) {
    try {
      const timeRange = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const logs = await PingLog.find({
        monitorId,
        timestamp: { $gte: timeRange }
      }).sort({ timestamp: -1 });

      const totalPings = logs.length;
      const successfulPings = logs.filter(log => log.status === 'success').length;
      const uptime = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0;

      const responseTimes = logs
        .filter(log => log.responseTime !== null)
        .map(log => log.responseTime);

      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      const incidents = [];
      let currentIncident = null;

      // Detect downtime incidents
      logs.reverse().forEach(log => {
        if (log.status === 'failure' && !currentIncident) {
          currentIncident = {
            startTime: log.timestamp,
            endTime: null,
            duration: 0
          };
        } else if (log.status === 'success' && currentIncident) {
          currentIncident.endTime = log.timestamp;
          currentIncident.duration = currentIncident.endTime - currentIncident.startTime;
          incidents.push(currentIncident);
          currentIncident = null;
        }
      });

      // If there's an ongoing incident
      if (currentIncident) {
        currentIncident.endTime = new Date();
        currentIncident.duration = currentIncident.endTime - currentIncident.startTime;
        incidents.push(currentIncident);
      }

      return {
        uptime: Math.round(uptime * 100) / 100,
        totalPings,
        successfulPings,
        avgResponseTime: Math.round(avgResponseTime),
        incidents: incidents.slice(0, 10), // Last 10 incidents
        period: `${hours}h`
      };
    } catch (error) {
      logger.error('Error getting monitor summary:', error);
      throw error;
    }
  }
}

export default new MonitoringService();
