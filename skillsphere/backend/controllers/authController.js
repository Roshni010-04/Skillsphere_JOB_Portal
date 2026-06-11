const User = require('../models/User');
const { generateAccessToken } = require('../utils/generateToken');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered' });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, role: role || 'client', verificationToken });
    const token = generateAccessToken(user._id);
    res.status(201).json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.isSuspended) return res.status(403).json({ success: false, message: 'Account suspended' });
    const token = generateAccessToken(user._id);
    res.json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','bio','phone','location','skills','portfolio','certifications','experience','hourlyRate','availability'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Wrong current password' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
