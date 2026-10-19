const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/medicines.controller');

router.use(authenticate);
router.get('/', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getAll);
router.get('/:id', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getById);
router.post('/', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.update);
router.patch('/:id/toggle', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.toggleActive);
router.delete('/:id', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.remove);

module.exports = router;
