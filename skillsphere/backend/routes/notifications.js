const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/controllers');
router.get('/', protect, ctrl.getNotifications);
router.put('/mark-read', protect, ctrl.markRead);
module.exports = router;
