const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/payments.controller');

router.use(authenticate);
router.get('/', requirePermission(PERMISSIONS.BILLING_VIEW), c.getAll);
router.get('/outstanding', requirePermission(PERMISSIONS.BILLING_VIEW), c.getOutstanding);
router.get('/:id', requirePermission(PERMISSIONS.BILLING_VIEW), c.getById);
router.post('/', requirePermission(PERMISSIONS.BILLING_MANAGE), c.recordPayment);

module.exports = router;
