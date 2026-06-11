const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const propCtrl = require('../controllers/proposalController');

router.post('/gig/:gigId', protect, authorize('freelancer'), propCtrl.submitProposal);
router.get('/gig/:gigId', protect, propCtrl.getProposals);
router.get('/my', protect, authorize('freelancer'), propCtrl.getMyProposals);
router.put('/:id/status', protect, authorize('client'), propCtrl.updateProposalStatus);

module.exports = router;
