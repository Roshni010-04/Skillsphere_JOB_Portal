const User = require('../models/User');
const { Review, Message, Payment, Notification, Dispute, AdminLog } = require('../models/index');
const Gig = require('../models/Gig');

// ====== USER CONTROLLER ======
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await User.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.profileViews': 1 } });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const forbidden = ['password', 'role', 'email', 'isVerified', 'isSuspended'];
    forbidden.forEach(f => delete req.body[f]);
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getFreelancers = async (req, res) => {
  try {
    const { skills, availability, city, minRating, page = 1, limit = 12, sort = '-reputation.averageRating' } = req.query;
    const filter = { role: 'freelancer', isActive: true, isSuspended: false };
    if (skills) filter['freelancerProfile.skills.name'] = { $in: skills.split(',') };
    if (availability) filter['freelancerProfile.availability'] = availability;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minRating) filter['reputation.averageRating'] = { $gte: Number(minRating) };
    const skip = (page - 1) * limit;
    const [freelancers, total] = await Promise.all([
      User.find(filter).select('-password -emailVerificationToken -passwordResetToken').sort(sort).skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, freelancers, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateAvailability = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { 'freelancerProfile.availability': req.body.availability }, { new: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.saveGig = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.savedGigs.indexOf(req.params.gigId);
    if (idx === -1) user.savedGigs.push(req.params.gigId);
    else user.savedGigs.splice(idx, 1);
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, saved: idx === -1 });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== REVIEW CONTROLLER ======
exports.createReview = async (req, res) => {
  try {
    const existing = await Review.findOne({ gig: req.body.gigId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await Review.create({ ...req.body, reviewer: req.user._id, gig: req.body.gigId, reviewee: req.body.revieweeId });
    // Update reputation
    const reviews = await Review.find({ reviewee: req.body.revieweeId, isFraudulent: false });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const score = Math.min(100, Math.round(avg * 20 + Math.min(reviews.length, 50)));
    await User.findByIdAndUpdate(req.body.revieweeId, { 'reputation.averageRating': avg, 'reputation.totalReviews': reviews.length, 'reputation.score': score });

    await Notification.create({ user: req.body.revieweeId, type: 'review_added', title: 'New Review!', message: `You received a ${req.body.rating}-star review`, link: `/profile/${req.body.revieweeId}` });
    if (req.io) req.io.to(req.body.revieweeId.toString()).emit('new_notification', { type: 'review' });

    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId, isFraudulent: false })
      .populate('reviewer', 'name avatar').populate('gig', 'title').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== MESSAGE CONTROLLER ======
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
      .populate('sender', 'name avatar').populate('receiver', 'name avatar').sort('-createdAt');
    const convMap = {};
    messages.forEach(m => {
      if (!convMap[m.conversation]) convMap[m.conversation] = m;
    });
    res.json({ success: true, conversations: Object.values(convMap) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const ids = [req.user._id.toString(), req.params.userId].sort();
    const conversation = ids.join('_');
    const messages = await Message.find({ conversation }).populate('sender', 'name avatar').sort('createdAt');
    await Message.updateMany({ conversation, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const ids = [req.user._id.toString(), req.params.userId].sort();
    const conversation = ids.join('_');
    const msg = await Message.create({ ...req.body, sender: req.user._id, receiver: req.params.userId, conversation });
    await msg.populate('sender', 'name avatar');
    if (req.io) req.io.to(req.params.userId).emit('new_message', msg);
    res.status(201).json({ success: true, message: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== PAYMENT CONTROLLER ======
exports.createPayment = async (req, res) => {
  try {
    const { gigId, freelancerId, amount, type, milestone, proposalId } = req.body;
    const platformFee = Math.round(amount * 0.1);
    const freelancerAmount = amount - platformFee;
    const payment = await Payment.create({ gig: gigId, proposal: proposalId, client: req.user._id, freelancer: freelancerId, amount, type: type || 'escrow', platformFee, freelancerAmount, milestone });
    res.status(201).json({ success: true, payment, clientSecret: `mock_${payment._id}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, client: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();
    await User.findByIdAndUpdate(payment.freelancer, { $inc: { 'freelancerProfile.totalEarnings': payment.freelancerAmount } });
    await Notification.create({ user: payment.freelancer, type: 'payment_received', title: '💰 Payment Released!', message: `₹${payment.freelancerAmount} has been released to your account`, link: `/payments` });
    if (req.io) req.io.to(payment.freelancer.toString()).emit('new_notification', { type: 'payment' });
    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPayments = async (req, res) => {
  try {
    const filter = req.user.role === 'client' ? { client: req.user._id } : { freelancer: req.user._id };
    const payments = await Payment.find(filter).populate('gig', 'title').populate('client', 'name avatar').populate('freelancer', 'name avatar').sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== NOTIFICATION CONTROLLER ======
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json({ success: true, notifications });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== DISPUTE CONTROLLER ======
exports.createDispute = async (req, res) => {
  try {
    const dispute = await Dispute.create({ ...req.body, raisedBy: req.user._id });
    res.status(201).json({ success: true, dispute });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ $or: [{ raisedBy: req.user._id }, { against: req.user._id }] }).populate('gig', 'title').sort('-createdAt');
    res.json({ success: true, disputes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== ADMIN CONTROLLER ======
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalGigs, totalPayments, openDisputes, activeFreelancers, recentUsers] = await Promise.all([
      User.countDocuments(),
      Gig.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, fees: { $sum: '$platformFee' } } }]),
      Dispute.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'freelancer', isActive: true }),
      User.find().sort('-createdAt').limit(10).select('name email role createdAt isSuspended isVerified')
    ]);
    const revenue = totalPayments[0] || { total: 0, fees: 0 };
    res.json({ success: true, stats: { totalUsers, totalGigs, totalRevenue: revenue.total, platformFees: revenue.fees, openDisputes, activeFreelancers }, recentUsers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)), User.countDocuments(filter)]);
    res.json({ success: true, users, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: req.body.suspend }, { new: true });
    await AdminLog.create({ admin: req.user._id, action: req.body.suspend ? 'suspend_user' : 'unsuspend_user', targetType: 'user', targetId: user._id });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyFreelancer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { 'freelancerProfile.isVerifiedFreelancer': true, 'freelancerProfile.verificationBadge': 'gold' }, { new: true });
    await AdminLog.create({ admin: req.user._id, action: 'verify_freelancer', targetType: 'user', targetId: user._id });
    await Notification.create({ user: user._id, type: 'system', title: '✅ Verified Freelancer!', message: 'Congratulations! You are now a verified freelancer on SkillSphere.' });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('raisedBy', 'name').populate('against', 'name').populate('gig', 'title').sort('-createdAt');
    res.json({ success: true, disputes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resolveDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status: req.body.status, resolution: req.body.resolution, resolvedBy: req.user._id, resolvedAt: new Date() }, { new: true });
    res.json({ success: true, dispute });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ====== SEARCH CONTROLLER ======
exports.search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });
    const results = {};
    const regex = new RegExp(q, 'i');
    if (type === 'all' || type === 'gigs') {
      results.gigs = await Gig.find({ $or: [{ title: regex }, { skills: regex }, { category: regex }], status: 'open' }).populate('client', 'name avatar').limit(10);
    }
    if (type === 'all' || type === 'freelancers') {
      results.freelancers = await User.find({ role: 'freelancer', isActive: true, $or: [{ name: regex }, { 'freelancerProfile.title': regex }, { 'freelancerProfile.skills.name': regex }] }).select('-password').limit(10);
    }
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
