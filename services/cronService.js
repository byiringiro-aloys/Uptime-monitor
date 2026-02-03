import cron from 'node-cron';
import User from '../models/User.js';
import Monitor from '../models/Monitor.js';
import PingLog from '../models/PingLog.js';
import { sendWeeklyReport } from './emailService.js';
import logger from '../utils/logger.js';
import monitoringService from './monitoringService.js';

class CronService {
    start() {
        logger.info('⏰ Cron service started');

        // Weekly Report: Every Sunday at 00:00
        cron.schedule('0 0 * * 0', async () => {
            logger.info('📊 Starting weekly report generation...');
            await this.generateWeeklyReports();
        });
    }

    async generateWeeklyReports() {
        try {
            const users = await User.find({ isActive: true, isVerified: true });
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            for (const user of users) {
                const monitors = await Monitor.find({ userId: user._id });

                if (monitors.length === 0) continue;

                let totalUptime = 0;
                let totalIncidents = 0;

                for (const monitor of monitors) {
                    try {
                        const summary = await monitoringService.getMonitorSummary(monitor._id, 24 * 7);
                        totalUptime += summary.uptime;
                        totalIncidents += summary.incidents.length;
                    } catch (error) {
                        logger.error(`Error getting summary for monitor ${monitor._id}:`, error);
                    }
                }

                const avgUptime = (totalUptime / monitors.length).toFixed(2);

                await sendWeeklyReport(user.email, user.username, {
                    uptime: avgUptime,
                    incidents: totalIncidents
                });

                logger.info(`📧 Weekly report sent to ${user.email}`);
            }
        } catch (error) {
            logger.error('Error generating weekly reports:', error);
        }
    }
}

export default new CronService();
