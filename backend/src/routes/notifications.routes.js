const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const { query, queryOne, NVarChar } = require('../database/db');
const pushService = require('../services/notifications/push.service');
const { success, error } = require('../utils/response');
const { daysUntil } = require('../utils/helpers');

router.use(authenticate);

const getPushTokens = async () => {
  const result = await query("SELECT PushToken FROM dbo.Users WHERE IsActive=1 AND PushToken IS NOT NULL AND PushToken != ''");
  return result.recordset.map(u => u.PushToken).filter(Boolean);
};

// POST /notifications/payment-reminder/:invoiceId
router.post('/payment-reminder/:invoiceId', requirePermission(PERMISSIONS.BILLING_MANAGE), async (req, res) => {
  try {
    const inv = await queryOne(
      'SELECT * FROM dbo.Invoices WHERE Id=@id',
      { id: { type: NVarChar(36), value: req.params.invoiceId } }
    );
    if (!inv) return error(res, 'Invoice not found', 404);

    const tokens = await getPushTokens();
    if (tokens.length > 0) {
      await pushService.sendPush(
        tokens,
        'Payment Reminder',
        `${inv.CustomerName} has a pending payment of ₹${parseFloat(inv.Amount).toFixed(2)}`
      );
    }
    return success(res, null, 'Reminder sent');
  } catch (err) {
    return error(res, 'Failed to send reminder');
  }
});

// POST /notifications/breeding-alert
router.post('/breeding-alert', requirePermission(PERMISSIONS.CATTLE_MANAGE), async (req, res) => {
  try {
    const result = await query("SELECT ExpectedCalvingDate FROM dbo.PregnancyRecords WHERE Status='Pregnant'");
    const due = result.recordset.filter(p => {
      const days = daysUntil(p.ExpectedCalvingDate);
      return days >= 0 && days <= 30;
    });

    const tokens = await getPushTokens();
    if (due.length > 0 && tokens.length > 0) {
      await pushService.sendPush(
        tokens,
        '🐄 Calving Due Soon',
        `${due.length} cow(s) are due to calve within 30 days`
      );
    }
    return success(res, { alertsSent: due.length });
  } catch (err) {
    return error(res, 'Failed to send breeding alerts');
  }
});

module.exports = router;
