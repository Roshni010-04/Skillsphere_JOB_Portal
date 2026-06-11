const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/controllers');
router.post('/', protect, ctrl.createDispute);
router.get('/my', protect, ctrl.getMyDisputes);
module.exports = router;
