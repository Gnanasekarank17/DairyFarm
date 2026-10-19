const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/expenses.controller');

router.use(authenticate);
router.use(requirePermission(PERMISSIONS.EXPENSES_VIEW));

router.get('/', c.getAll);
router.get('/summary/:year/:month', c.getMonthlySummary);
router.get('/categories', c.getCategories);
router.post('/categories', requirePermission(PERMISSIONS.EXPENSES_MANAGE), c.createCategory);
router.delete('/categories/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), c.removeCategory);
router.get('/:id', c.getById);
router.post('/', requirePermission(PERMISSIONS.EXPENSES_MANAGE), c.create);
router.put('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), c.update);
router.delete('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), c.remove);

module.exports = router;
