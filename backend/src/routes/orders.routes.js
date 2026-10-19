const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/orders.controller');

router.use(authenticate);
router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', c.create);
router.patch('/:id/status', requirePermission(PERMISSIONS.ORDERS_MANAGE), c.updateStatus);
router.post('/:id/cancel', c.cancel);

module.exports = router;
