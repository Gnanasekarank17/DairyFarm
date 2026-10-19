const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/deliveries.controller');

router.use(authenticate);
router.get('/statuses', requirePermission(PERMISSIONS.DELIVERIES_VIEW), c.getStatuses);
router.get('/today', requirePermission(PERMISSIONS.DELIVERIES_VIEW), c.getTodayDeliveries);
router.get('/:year/:month', requirePermission(PERMISSIONS.DELIVERIES_VIEW), c.getAllMonthly);
router.get('/:customerId/:year/:month', c.getMonthlyDelivery);
router.put('/:customerId/:year/:month/day', requirePermission(PERMISSIONS.DELIVERIES_MANAGE), c.updateDeliveryDay);
router.put('/:customerId/:year/:month/mark-all', requirePermission(PERMISSIONS.DELIVERIES_MANAGE), c.markEntireMonth);

module.exports = router;
