const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./config/logger');
const routes = require('./routes');
const { getPool } = require('./database/db');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.RATE_LIMIT_MAX) || 200 }));

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Routes
app.use('/api/v1', routes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const start = async () => {
  try {
    // Connect to SQL Server
    await getPool();
    logger.info('✅ SQL Server connected');

    // Start scheduler
    require('./services/scheduler');

    app.listen(config.port, () => {
      logger.info(`🚀 Dairy Farm API running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
};

start();
