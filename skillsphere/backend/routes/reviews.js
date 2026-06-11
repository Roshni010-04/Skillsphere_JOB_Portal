const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/controllers');
router.post('/', protect, ctrl.createReview);
router.get('/user/:userId', ctrl.getReviews);
module.exports = router;
