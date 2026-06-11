const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/controllers');
router.post('/', protect, authorize('client'), ctrl.createPayment);
router.put('/:id/release', protect, authorize('client'), ctrl.releasePayment);
router.get('/', protect, ctrl.getPayments);
module.exports = router;
