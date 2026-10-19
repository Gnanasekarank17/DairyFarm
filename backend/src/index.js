// Long-running server entry point (Docker / `npm start`).
// On Vercel the app is served from /api/index.js instead and cron jobs run via /api/v1/cron/daily.
const config = require('./config');
const logger = require('./config/logger');
const app = require('./app');
const { getPool } = require('./database/db');

const start = async () => {
  try {
    // Connect to SQL Server
    await getPool();
    logger.info('✅ SQL Server connected');

    // Start scheduler
    require('./services/scheduler').start();

    app.listen(config.port, () => {
      logger.info(`🚀 Dairy Farm API running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
};

start();
