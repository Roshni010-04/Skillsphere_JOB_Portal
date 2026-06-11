const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
router.get('/', async (req, res) => {
  try {
    const { role, skills, location, minRate, maxRate, rating, page = 1, limit = 12 } = req.query;
    const query = { isSuspended: false };
    if (role) query.role = role;
    if (skills) query['skills.name'] = { $in: skills.split(',') };
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (minRate || maxRate) query.hourlyRate = { $gte: minRate || 0, $lte: maxRate || 99999 };
    if (rating) query.rating = { $gte: parseFloat(rating) };
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort('-reputationScore').skip((page-1)*limit).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, users, total, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
module.exports = router;
