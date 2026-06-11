const Review = require('../models/Review');
const User = require('../models/User');
const Gig = require('../models/Gig');

exports.createReview = async (req, res) => {
  try {
    const gig = await Gig.findById(req.body.gig);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    const existing = await Review.findOne({ gig: req.body.gig, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const review = await Review.create({ ...req.body, reviewer: req.user._id });
    // Update user rating
    const reviews = await Review.find({ reviewee: req.body.reviewee });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const repScore = Math.min(reviews.length * 5 + avgRating * 10, 100);
    await User.findByIdAndUpdate(req.body.reviewee, { rating: avgRating.toFixed(1), reviewCount: reviews.length, reputationScore: repScore });
    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'name avatar').populate('gig', 'title').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
