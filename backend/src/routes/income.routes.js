const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/income.controller');

router.use(authenticate);
router.use(requirePermission(PERMISSIONS.INCOME_VIEW));

router.get('/', c.getAll);
router.get('/summary/:year/:month', c.getMonthlySummary);
router.get('/categories', c.getCategories);
router.post('/categories', requirePermission(PERMISSIONS.INCOME_MANAGE), c.createCategory);
router.delete('/categories/:id', requirePermission(PERMISSIONS.INCOME_MANAGE), c.removeCategory);
router.get('/:id', c.getById);
router.post('/', requirePermission(PERMISSIONS.INCOME_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.INCOME_MANAGE), c.update);
router.delete('/:id', requirePermission(PERMISSIONS.INCOME_MANAGE), c.remove);

module.exports = router;
