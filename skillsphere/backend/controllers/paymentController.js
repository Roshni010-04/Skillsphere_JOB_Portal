const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');
const crypto = require('crypto');
let io;
exports.setIo = (_io) => { io = _io; };

exports.createOrder = async (req, res) => {
  try {
    const { gigId, milestoneTitle, amount } = req.body;
    const gig = await Gig.findById(gigId).populate('assignedFreelancer');
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    const platformFee = amount * 0.1;
    const freelancerAmount = amount - platformFee;
    const payment = await Payment.create({
      gig: gigId, client: req.user._id, freelancer: gig.assignedFreelancer._id,
      amount, platformFee, freelancerAmount, milestone: milestoneTitle,
      status: 'pending', transactionId: crypto.randomUUID()
    });
    // In production, create Razorpay order here
    const mockOrder = { id: `order_${Date.now()}`, amount: amount * 100, currency: 'INR' };
    res.json({ success: true, payment, order: mockOrder });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    payment.status = 'escrow';
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();
    await createNotification(io, {
      user: payment.freelancer, title: 'Payment in Escrow',
      message: `₹${payment.amount} is held in escrow for your work`, type: 'payment'
    });
    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.client.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();
    await User.findByIdAndUpdate(payment.freelancer, { $inc: { totalEarnings: payment.freelancerAmount } });
    await createNotification(io, { user: payment.freelancer, title: 'Payment Released!', message: `₹${payment.freelancerAmount} has been released to you`, type: 'payment' });
    res.json({ success: true, payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getTransactions = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { $or: [{ client: req.user._id }, { freelancer: req.user._id }] };
    const payments = await Payment.find(query).populate('gig', 'title').populate('client freelancer', 'name avatar').sort('-createdAt');
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
