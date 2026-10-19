const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/milkRates.controller');

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.BILLING_VIEW), c.getAll);
router.get('/effective', requirePermission(PERMISSIONS.BILLING_VIEW), c.getEffective);
router.post('/', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.update);
router.delete('/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.remove);

module.exports = router;
