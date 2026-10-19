const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/subscriptions.controller');

router.use(authenticate);
router.get('/', c.getAll);
router.get('/:id', c.getById);
router.get('/:id/history', c.getHistory);
router.post('/', c.create);
router.put('/:id', requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), c.amend);
router.patch('/:id/status', requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE), c.updateStatus);
router.post('/:id/pause', c.pause);
router.post('/:id/resume', c.resume);
router.post('/:id/cancel', c.cancel);

module.exports = router;
