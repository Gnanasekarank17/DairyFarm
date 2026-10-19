const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/milkProduction.controller');

router.use(authenticate);
router.post('/', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.record);
router.get('/', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getAll);
router.get('/summary', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getSummary);
router.get('/cow/:cowId', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getCowHistory);

module.exports = router;
