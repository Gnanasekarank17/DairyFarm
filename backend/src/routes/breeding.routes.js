const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/breeding.controller');

router.use(authenticate);
router.post('/', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.createBreedingRecord);
router.get('/', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getAll);
router.get('/upcoming-calving', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getUpcomingCalving);
router.get('/:id', requirePermission(PERMISSIONS.CATTLE_VIEW), c.getById);
router.put('/:id/confirm-pregnancy', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.confirmPregnancy);
router.put('/:id/conception', requirePermission(PERMISSIONS.CATTLE_MANAGE), c.setConception);

module.exports = router;
