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
const blob = require('./services/blob.service');
const { hasNotoFonts } = require('./services/invoicePdf.service');

const app = express();

// Behind Vercel / nginx the client IP arrives in X-Forwarded-For.
if (config.isServerless || process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: Number(process.env.RATE_LIMIT_MAX) || 200 }));

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check. `?db=1` also opens a SQL Server connection, `?blob=1` also lists the Blob store.
const health = async (req, res) => {
  const out = {
    status: 'ok',
    ts: new Date().toISOString(),
    runtime: config.isServerless ? 'vercel' : 'node',
    region: process.env.VERCEL_REGION || null,
    blobConfigured: blob.isConfigured(),
    pdfFonts: hasNotoFonts(),
  };
  if (req.query.db) {
    try {
      const pool = await getPool();
      const r = await pool.request().query('SELECT DB_NAME() AS db, @@SERVERNAME AS server');
      out.db = { ok: true, ...r.recordset[0] };
    } catch (err) {
      out.status = 'degraded';
      out.db = { ok: false, error: err.message };
    }
  }
  if (req.query.blob) {
    try {
      const r = await blob.list({ prefix: 'backups/', limit: 1 });
      out.blob = { ok: true, sample: r.blobs.map((b) => b.pathname) };
    } catch (err) {
      out.status = 'degraded';
      out.blob = { ok: false, error: err.message };
    }
  }
  res.status(out.status === 'ok' ? 200 : 503).json(out);
};
app.get('/health', health);
app.get('/api/v1/health', health);

// Routes
app.use('/api/v1', routes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
