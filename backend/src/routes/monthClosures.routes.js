const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/monthClosures.controller');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.BILLING_VIEW), c.getAll);
router.get('/:year/:month', requirePermission(PERMISSIONS.BILLING_VIEW), c.getStatus);
router.post('/:year/:month/close', requirePermission(PERMISSIONS.BILLING_MANAGE), c.close);
router.post('/:year/:month/reopen', requireAdmin, c.reopen);

module.exports = router;
