const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/customers.controller');

router.use(authenticate);
router.get('/', requirePermission(PERMISSIONS.CUSTOMERS_VIEW), c.getAll);
router.get('/:id', requirePermission(PERMISSIONS.CUSTOMERS_VIEW), c.getById);
router.post('/', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), c.update);
router.patch('/:id/toggle', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), c.toggleActive);
router.delete('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), c.remove);

module.exports = router;
