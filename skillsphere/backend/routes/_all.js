const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/controllers');

// USERS
const usersRouter = express.Router();
usersRouter.get('/freelancers', ctrl.getFreelancers);
usersRouter.get('/:id', ctrl.getProfile);
usersRouter.put('/profile', protect, ctrl.updateProfile);
usersRouter.put('/availability', protect, authorize('freelancer'), ctrl.updateAvailability);
usersRouter.post('/save-gig/:gigId', protect, ctrl.saveGig);
module.exports.users = usersRouter;

// GIGS
const gigsRouter = express.Router();
const gigCtrl = require('../controllers/gigController');
gigsRouter.get('/', gigCtrl.getGigs);
gigsRouter.post('/', protect, authorize('client'), gigCtrl.createGig);
gigsRouter.get('/my', protect, gigCtrl.getMyGigs);
gigsRouter.get('/:id', protect, gigCtrl.getGig);
gigsRouter.put('/:id', protect, authorize('client'), gigCtrl.updateGig);
gigsRouter.delete('/:id', protect, authorize('client'), gigCtrl.deleteGig);
gigsRouter.get('/:id/recommendations', protect, authorize('client'), gigCtrl.getRecommendedFreelancers);
gigsRouter.put('/:id/milestones/:milestoneId', protect, gigCtrl.updateMilestone);
module.exports.gigs = gigsRouter;

// PROPOSALS
const proposalsRouter = express.Router();
const propCtrl = require('../controllers/proposalController');
proposalsRouter.post('/gig/:gigId', protect, authorize('freelancer'), propCtrl.submitProposal);
proposalsRouter.get('/gig/:gigId', protect, propCtrl.getProposals);
proposalsRouter.get('/my', protect, authorize('freelancer'), propCtrl.getMyProposals);
proposalsRouter.put('/:id/status', protect, authorize('client'), propCtrl.updateProposalStatus);
proposalsRouter.put('/:id/withdraw', protect, authorize('freelancer'), propCtrl.withdrawProposal);
module.exports.proposals = proposalsRouter;

// REVIEWS
const reviewsRouter = express.Router();
reviewsRouter.post('/', protect, ctrl.createReview);
reviewsRouter.get('/user/:userId', ctrl.getReviews);
module.exports.reviews = reviewsRouter;

// MESSAGES
const messagesRouter = express.Router();
messagesRouter.get('/conversations', protect, ctrl.getConversations);
messagesRouter.get('/:userId', protect, ctrl.getMessages);
messagesRouter.post('/:userId', protect, ctrl.sendMessage);
module.exports.messages = messagesRouter;

// PAYMENTS
const paymentsRouter = express.Router();
paymentsRouter.post('/', protect, authorize('client'), ctrl.createPayment);
paymentsRouter.put('/:id/release', protect, authorize('client'), ctrl.releasePayment);
paymentsRouter.get('/', protect, ctrl.getPayments);
module.exports.payments = paymentsRouter;

// NOTIFICATIONS
const notificationsRouter = express.Router();
notificationsRouter.get('/', protect, ctrl.getNotifications);
notificationsRouter.put('/mark-read', protect, ctrl.markRead);
module.exports.notifications = notificationsRouter;

// DISPUTES
const disputesRouter = express.Router();
disputesRouter.post('/', protect, ctrl.createDispute);
disputesRouter.get('/my', protect, ctrl.getMyDisputes);
module.exports.disputes = disputesRouter;

// ADMIN
const adminRouter = express.Router();
adminRouter.get('/dashboard', protect, authorize('admin'), ctrl.getDashboard);
adminRouter.get('/users', protect, authorize('admin'), ctrl.getAllUsers);
adminRouter.put('/users/:id/suspend', protect, authorize('admin'), ctrl.suspendUser);
adminRouter.put('/users/:id/verify', protect, authorize('admin'), ctrl.verifyFreelancer);
adminRouter.get('/disputes', protect, authorize('admin'), ctrl.getAllDisputes);
adminRouter.put('/disputes/:id/resolve', protect, authorize('admin'), ctrl.resolveDispute);
module.exports.admin = adminRouter;

// SEARCH
const searchRouter = express.Router();
searchRouter.get('/', ctrl.search);
module.exports.search = searchRouter;
