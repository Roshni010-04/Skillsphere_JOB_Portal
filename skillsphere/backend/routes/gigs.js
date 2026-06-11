const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const gigCtrl = require('../controllers/gigController');

router.get('/', gigCtrl.getGigs);
router.post('/', protect, authorize('client'), gigCtrl.createGig);
router.get('/my', protect, gigCtrl.getMyGigs);
router.get('/:id', gigCtrl.getGig);
router.put('/:id', protect, authorize('client'), gigCtrl.updateGig);
router.delete('/:id', protect, authorize('client'), gigCtrl.deleteGig);
router.get('/:id/matches', protect, gigCtrl.getAIMatches);

module.exports = router;
