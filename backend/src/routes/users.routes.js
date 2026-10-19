const express = require('express');
const router = express.Router();
const { authenticate, requirePermission, PERMISSIONS } = require('../middleware/auth.middleware');
const c = require('../controllers/users.controller');

router.use(authenticate);
router.use(requirePermission(PERMISSIONS.USERS_MANAGE));

router.get('/', c.getAll);
router.get('/roles', c.getRoles);
router.get('/:id', c.getById);
router.post('/', c.create);
router.put('/:id', c.update);
router.patch('/:id/toggle', c.toggleActive);
router.delete('/:id', c.remove);

module.exports = router;