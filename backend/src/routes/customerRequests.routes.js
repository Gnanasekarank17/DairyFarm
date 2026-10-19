const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const c = require('../controllers/customerRequests.controller');

router.use(authenticate);
router.get('/:year/:month', c.getMonthly);
router.post('/', c.create);
router.patch('/:id/status', c.updateStatus);

module.exports = router;