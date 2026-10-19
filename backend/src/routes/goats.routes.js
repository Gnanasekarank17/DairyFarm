const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/goats.controller');

router.use(authenticate);
router.get('/', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getAll);
router.get('/:id', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getById);
router.post('/', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.update);
router.delete('/:id', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.remove);
router.get('/:id/weights', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getWeights);
router.post('/:id/weights', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.addWeight);
router.delete('/:id/weights/:weightId', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.removeWeight);

module.exports = router;
