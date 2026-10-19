const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/products.controller');

router.use(authenticate);

router.get('/', c.getAll);
router.get('/low-stock', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.getLowStock);
router.post('/', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.update);
router.patch('/:id/stock', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.adjustStock);
router.patch('/:id/toggle', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.toggleActive);
router.delete('/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), c.remove);

module.exports = router;
