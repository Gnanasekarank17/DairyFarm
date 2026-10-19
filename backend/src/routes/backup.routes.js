const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const { query } = require('../database/db');
const { success, error } = require('../utils/response');
const blob = require('../services/blob.service');
const logger = require('../config/logger');

router.use(authenticate, requirePermission(PERMISSIONS.BACKUP_MANAGE));

const BACKUP_PREFIX = 'backups/';
const BACKUP_TABLES = [
  'Customers', 'Invoices', 'Deliveries', 'Payments', 'CowMaster', 'Users',
  'Products', 'Orders', 'Subscriptions', 'MilkRates', 'Expenses', 'Income',
];

const buildSnapshot = async () => {
  const snapshot = { createdAt: new Date().toISOString(), tables: {} };
  for (const table of BACKUP_TABLES) {
    try {
      snapshot.tables[table] = (await query(`SELECT * FROM dbo.[${table}]`)).recordset;
    } catch (err) {
      // Table may not exist in older schemas: record it and keep going.
      snapshot.tables[table] = { error: err.message };
    }
  }
  // Backwards-compatible top-level keys used by the original export format.
  snapshot.customers  = snapshot.tables.Customers;
  snapshot.invoices   = snapshot.tables.Invoices;
  snapshot.deliveries = snapshot.tables.Deliveries;
  snapshot.cows       = snapshot.tables.CowMaster;
  return snapshot;
};

const fileNameFor = (iso) => `dairy-backup-${iso.replace(/[:.]/g, '-')}.json`;

// POST /backup/create — snapshot key tables as JSON.
//   Blob configured  -> stored privately in Vercel Blob; returns metadata.
//   Blob missing     -> streams the JSON as a download (legacy behaviour).
//   ?download=1      -> always stream the JSON as a download.
router.post('/create', async (req, res) => {
  try {
    const snapshot = await buildSnapshot();
    const json = JSON.stringify(snapshot, null, 2);
    const fileName = fileNameFor(snapshot.createdAt);

    if (!blob.isConfigured() || req.query.download) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(json);
    }

    const stored = await blob.upload(`${BACKUP_PREFIX}${fileName}`, json, {
      contentType: 'application/json',
      access: 'private',
      addRandomSuffix: false,
    });
    logger.info(`Backup stored in Blob: ${stored.pathname} (${stored.size} bytes)`);
    return success(res, {
      pathname: stored.pathname,
      size: stored.size,
      createdAt: snapshot.createdAt,
      downloadPath: `/api/v1/backup/download?pathname=${encodeURIComponent(stored.pathname)}`,
    }, 'Backup saved to cloud storage', 201);
  } catch (err) {
    logger.error('Backup create:', err);
    return error(res, 'Backup failed');
  }
});

// GET /backup/list — backups stored in Blob (newest first)
router.get('/list', async (req, res) => {
  try {
    if (!blob.isConfigured()) return success(res, [], 'Cloud storage not configured; backups download on demand');
    const result = await blob.list({ prefix: BACKUP_PREFIX, limit: 200 });
    const items = result.blobs
      .map((b) => ({
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
        downloadPath: `/api/v1/backup/download?pathname=${encodeURIComponent(b.pathname)}`,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return success(res, items);
  } catch (err) {
    logger.error('Backup list:', err);
    return error(res, 'Failed to list backups');
  }
});

// GET /backup/download?pathname=backups/xxx.json — stream a stored backup
router.get('/download', async (req, res) => {
  try {
    const pathname = String(req.query.pathname || '');
    if (!pathname.startsWith(BACKUP_PREFIX)) return error(res, 'Invalid backup path', 400);
    const file = await blob.download(pathname);
    if (!file) return error(res, 'Backup not found', 404);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${pathname.slice(BACKUP_PREFIX.length)}"`);
    if (file.size) res.setHeader('Content-Length', file.size);
    file.stream.pipe(res);
  } catch (err) {
    logger.error('Backup download:', err);
    return error(res, 'Failed to download backup');
  }
});

// DELETE /backup?pathname=backups/xxx.json
router.delete('/', async (req, res) => {
  try {
    const pathname = String(req.query.pathname || '');
    if (!pathname.startsWith(BACKUP_PREFIX)) return error(res, 'Invalid backup path', 400);
    await blob.remove(pathname);
    return success(res, { pathname }, 'Backup deleted');
  } catch (err) {
    logger.error('Backup delete:', err);
    return error(res, 'Failed to delete backup');
  }
});

module.exports = router;
