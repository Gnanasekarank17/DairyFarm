// Vercel Cron entry points. Vercel calls these with `Authorization: Bearer <CRON_SECRET>`.
// An authenticated admin may also trigger them manually with their normal JWT.
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const config = require('../config');
const { success, error } = require('../utils/response');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const scheduler = require('../services/scheduler');
const logger = require('../config/logger');

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
};

const cronAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (config.cronSecret && safeEqual(bearer, config.cronSecret)) return next();
  // Fall back to a normal admin login so jobs can be triggered from the app.
  return authenticate(req, res, () => requireAdmin(req, res, next));
};

router.use(cronAuth);

// GET|POST /cron/daily?force=1
const daily = async (req, res) => {
  const startedAt = Date.now();
  try {
    const results = await scheduler.runDaily({ force: Boolean(req.query.force) });
    const failed = results.filter((r) => !r.ok).length;
    logger.info(`Cron daily finished: ${results.length} jobs, ${failed} failed, ${Date.now() - startedAt}ms`);
    return success(res, { results, durationMs: Date.now() - startedAt }, failed ? 'Completed with errors' : 'Completed');
  } catch (err) {
    logger.error('Cron daily:', err);
    return error(res, 'Cron run failed');
  }
};
router.get('/daily', daily);
router.post('/daily', daily);

// GET|POST /cron/:job — run a single job by name
const single = async (req, res) => {
  const fn = scheduler.jobs[req.params.job];
  if (!fn) return error(res, `Unknown job. Available: ${Object.keys(scheduler.jobs).join(', ')}`, 404);
  try {
    return success(res, { job: req.params.job, result: await fn() });
  } catch (err) {
    logger.error(`Cron ${req.params.job}:`, err);
    return error(res, `Job ${req.params.job} failed`);
  }
};
router.get('/:job', single);
router.post('/:job', single);

module.exports = router;
