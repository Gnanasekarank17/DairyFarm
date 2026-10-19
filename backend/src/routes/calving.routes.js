const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/calving.controller');

router.use(authenticate);
router.post('/', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.recordCalving);
router.get('/', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getAll);
router.get('/:id', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getById);

module.exports = router;
