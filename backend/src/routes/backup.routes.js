const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const { query } = require('../database/db');
const { success, error } = require('../utils/response');

router.use(authenticate, requirePermission(PERMISSIONS.BACKUP_MANAGE));

// POST /backup/create — export key tables as JSON snapshot
router.post('/create', async (req, res) => {
  try {
    const [customers, invoices, deliveries, cows] = await Promise.all([
      query('SELECT * FROM dbo.Customers'),
      query('SELECT * FROM dbo.Invoices'),
      query('SELECT * FROM dbo.Deliveries'),
      query('SELECT * FROM dbo.CowMaster'),
    ]);

    const snapshot = {
      createdAt: new Date().toISOString(),
      customers:  customers.recordset,
      invoices:   invoices.recordset,
      deliveries: deliveries.recordset,
      cows:       cows.recordset,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="dairy-backup-${new Date().toISOString().slice(0,10)}.json"`);
    res.send(JSON.stringify(snapshot, null, 2));
  } catch (err) {
    return error(res, 'Backup failed');
  }
});

// GET /backup/list — placeholder (backups are file-downloads, not stored)
router.get('/list', async (req, res) => {
  return success(res, [], 'Backups are generated on-demand as JSON downloads');
});

module.exports = router;
