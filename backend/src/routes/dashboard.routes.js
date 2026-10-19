const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const { getSummary, getCustomerSummary } = require('../controllers/dashboard.controller');

router.use(authenticate);
router.get('/summary', requirePermission(PERMISSIONS.DASHBOARD_VIEW), getSummary);
router.get('/customer-summary', requirePermission(PERMISSIONS.DASHBOARD_VIEW), getCustomerSummary);

module.exports = router;
