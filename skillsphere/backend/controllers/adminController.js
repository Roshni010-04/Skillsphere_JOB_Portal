const User = require('../models/User');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalFreelancers, totalClients, totalGigs, openGigs, completedGigs,
      totalPayments, pendingDisputes] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Gig.countDocuments(),
      Gig.countDocuments({ status: 'open' }),
      Gig.countDocuments({ status: 'completed' }),
      Payment.aggregate([{ $match: { status: 'released' } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]),
      Dispute.countDocuments({ status: 'open' })
    ]);
    const revenue = totalPayments[0]?.total || 0;
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt avatar');
    const topCategories = await Gig.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'released' } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$platformFee' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 }
    ]);
    res.json({ success: true, stats: { totalUsers, totalFreelancers, totalClients, totalGigs, openGigs, completedGigs, revenue, pendingDisputes }, recentUsers, topCategories, monthlyRevenue });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, users, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: req.body.suspend }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyFreelancer = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('gig', 'title').populate('raisedBy against', 'name email avatar').sort('-createdAt');
    res.json({ success: true, disputes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.resolveDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, { status: 'resolved', resolution: req.body.resolution, resolvedBy: req.user._id, adminNotes: req.body.adminNotes }, { new: true });
    res.json({ success: true, dispute });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
