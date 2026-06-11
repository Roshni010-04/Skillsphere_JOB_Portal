const Gig = require('../models/Gig');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

let io;
exports.setIo = (_io) => { io = _io; };

exports.createGig = async (req, res) => {
  try {
    // Fix location.type conflict with mongoose reserved keyword
    if (req.body.location && req.body.location.type) {
      req.body.location.locationType = req.body.location.type;
      delete req.body.location.type;
    }
    const gig = await Gig.create({ ...req.body, client: req.user._id });
    await gig.populate('client', 'name avatar location');
    res.status(201).json({ success: true, gig });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getGigs = async (req, res) => {
  try {
    const { search, category, skills, minBudget, maxBudget, location, experienceLevel, duration, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { status: 'open', isApproved: true };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (skills) query.skills = { $in: skills.split(',') };
    if (location) query['locationDetails.city'] = new RegExp(location, 'i');
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (duration) query.duration = duration;
    if (minBudget || maxBudget) {
      query.$or = [
        { 'budget.fixed': { $gte: minBudget || 0, $lte: maxBudget || 999999 } },
        { 'budget.max': { $gte: minBudget || 0 } }
      ];
    }
    const skip = (page - 1) * limit;
    const [gigs, total] = await Promise.all([
      Gig.find(query).populate('client', 'name avatar location rating').sort(sort).skip(skip).limit(parseInt(limit)),
      Gig.countDocuments(query)
    ]);
    res.json({ success: true, gigs, total, pages: Math.ceil(total / limit), page: parseInt(page) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getGig = async (req, res) => {
  try {
    const gig = await Gig.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('client', 'name avatar location rating reviewCount completedProjects bio')
      .populate({ path: 'proposals', populate: { path: 'freelancer', select: 'name avatar rating skills' } });
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    res.json({ success: true, gig });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateGig = async (req, res) => {
  try {
    const gig = await Gig.findOne({ _id: req.params.id, client: req.user._id });
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found or unauthorized' });
    Object.assign(gig, req.body);
    await gig.save();
    res.json({ success: true, gig });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteGig = async (req, res) => {
  try {
    await Gig.findOneAndDelete({ _id: req.params.id, client: req.user._id });
    res.json({ success: true, message: 'Gig deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyGigs = async (req, res) => {
  try {
    const field = req.user.role === 'client' ? 'client' : 'assignedFreelancer';
    const gigs = await Gig.find({ [field]: req.user._id })
      .populate('client assignedFreelancer', 'name avatar rating')
      .sort('-createdAt');
    res.json({ success: true, gigs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProgress = async (req, res) => {
  try {
    const { completionPercentage, logMessage } = req.body;
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    gig.completionPercentage = completionPercentage;
    if (logMessage) gig.progressLogs.push({ message: logMessage, by: req.user._id });
    if (completionPercentage === 100) gig.status = 'completed';
    await gig.save();
    res.json({ success: true, gig });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAIMatches = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    const freelancers = await User.find({ role: 'freelancer', availability: 'available', isSuspended: false })
      .select('name avatar skills rating reviewCount location hourlyRate reputationScore');
    const scored = freelancers.map(f => {
      const skillMatch = f.skills?.filter(s => gig.skills.includes(s.name)).length || 0;
      const skillScore = (skillMatch / Math.max(gig.skills.length, 1)) * 40;
      const ratingScore = (f.rating / 5) * 30;
      const repScore = Math.min(f.reputationScore / 100, 1) * 20;
      const reviewBonus = Math.min(f.reviewCount / 10, 1) * 10;
      return { ...f.toObject(), matchScore: Math.round(skillScore + ratingScore + repScore + reviewBonus) };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
    res.json({ success: true, matches: scored });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
