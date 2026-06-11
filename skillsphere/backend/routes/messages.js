const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/controllers');
router.get('/conversations', protect, ctrl.getConversations);
router.get('/:userId', protect, ctrl.getMessages);
router.post('/:userId', protect, ctrl.sendMessage);
module.exports = router;
